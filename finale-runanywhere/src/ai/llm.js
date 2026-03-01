import { TextGeneration } from '@runanywhere/web-llamacpp'
import { isWorkerAvailable, generateViaWorker, generateQuizViaWorker } from './aiWorkerClient'
import { addDebugLog, DebugCategory } from '../store/debugStore'
import { fallbackQuizzes } from '../data/fallbackQuizzes.js'

// ─── LLM timeout (new: 120s generation) ──────────────────────────────────────
const LLM_TIMEOUT_MS = 120_000

// ─── AI init timeout (new: 180s init) ──────────────────────────────────────
export const AI_INIT_TIMEOUT_MS = 180_000

function runWithTimeout(promise, ms, label = 'AI task') {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
        promise
            .then((v) => { clearTimeout(timer); resolve(v) })
            .catch((e) => { clearTimeout(timer); reject(e) })
    })
}

// ─── Single System Prompt ───────────────────────────────────────────────────
const SINGLE_PROMPT = `You are Vaani AI, a bilingual English speaking tutor for Hindi users.

If the user writes in Hindi or Hinglish:
- Convert it into natural English
- Show the corrected English sentence
- Explain in simple Hindi
- Give one short practice sentence

If the user writes in English:
- Correct grammar and fluency
- Explain mistakes in Hindi
- Encourage repetition

Keep responses short and spoken.`

// ─── Get system prompt for mode ──────────────────────────────────────────────
export function getSystemPrompt(detectedLang = 'hindi') {
    return SINGLE_PROMPT
}

// ─── Parse JSON response ──────────────────────────────────────
export function parseTeachingResponse(text) {
    if (!text) return null
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) return null
        return JSON.parse(jsonMatch[0])
    } catch {
        return null
    }
}

// ─── Language detection (Hindi, Hinglish, English) ───────────────────────────
const HINGLISH_KEYWORDS = [
    'kaise', 'kya', 'main', 'mera', 'tera', 'aap', 'hum', 'tum', 'yeh', 'woh',
    'hai', 'hain', 'tha', 'thi', 'raha', 'rahi', 'gaya', 'gayi', 'karo', 'karo',
    'accha', 'theek', 'bahut', 'zyada', 'nahi', 'nahin', 'bilkul', 'haan', 'nahi',
    'lekin', 'aur', 'phir', 'matlab', 'samajh', 'bolo', 'sunao', 'jao', 'aao',
]

export function detectLanguage(text) {
    if (!text) return 'english'
    const lower = text.toLowerCase()
    const devanagariPattern = /[\u0900-\u097F]/
    const hasDevanagari = devanagariPattern.test(text)
    const hasLatin = /[a-zA-Z]/.test(text)

    if (hasDevanagari && hasLatin) return 'hinglish'
    if (hasDevanagari) return 'hindi'

    // Detect Romanized Hindi (Hinglish written in Latin script)
    const wordCount = lower.split(/\s+/).length
    const hinglishMatches = HINGLISH_KEYWORDS.filter(kw => lower.includes(kw)).length
    if (wordCount >= 2 && hinglishMatches >= 1) return 'hinglish'

    return 'english'
}

// ─── Clean LLM output: remove control chars but PRESERVE Devanagari ───────────
export function cleanLLMOutput(text) {
    if (!text) return ''
    return text
        // Strip only real control characters (NOT Devanagari which is U+0900-U+097F)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Strip "Assistant:" prefix
        .replace(/^\s*(Assistant:|User:)\s*/i, '')
        // Strip triple backticks
        .replace(/```[a-z]*/gi, '').replace(/```/g, '')
        // Collapse excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

// ─── Generate conversation response (streaming) ─────────────────────────────
export async function generateResponse(userMessage, history = [], onToken, detectedLangOverride) {
    const detectedLang = detectedLangOverride || detectLanguage(userMessage)
    console.log('[LLM] generateResponse started:', { userMessage, detectedLang })

    const recentHistory = history.slice(-6) // Only last 3 exchanges (6 messages)
    let contextStr = ''
    for (const msg of recentHistory) {
        if (msg.role === 'user') contextStr += `User: ${msg.content}\n`
        else if (msg.content) {
            let display = msg.content
            const parsed = parseTeachingResponse(msg.content)
            if (parsed && typeof parsed === 'object') {
                display = parsed.english || parsed.better_sentence || msg.content
            }
            contextStr += `Assistant: ${display}\n`
        }
    }

    const prompt = `${contextStr}User: ${userMessage}\nAssistant:`
    const systemPrompt = getSystemPrompt(detectedLang)

    let fullText = ''

    // ─── Try Worker first ────────────────────────────────────────────────────
    if (isWorkerAvailable()) {
        try {
            const result = await generateViaWorker(prompt, {
                systemPrompt,
                maxTokens: 256,
                temperature: 0.7,
                top_p: 0.9,
                repeat_penalty: 1.1,
                context_length: 4096,
                n_batch: 'auto',
                stopSequences: ['User:', '\n\n\n\n'],
                timeoutMs: LLM_TIMEOUT_MS,
            }, (accumulated) => {
                fullText = accumulated
                onToken?.(accumulated)
            })
            fullText = result.text
        } catch (workerErr) {
            console.warn('[LLM] Worker failed, falling back to main thread:', workerErr.message)
            fullText = ''
        }
    }

    // ─── Fallback: main thread ───────────────────────────────────────────────
    if (!fullText.trim()) {
        try {
            const { stream, result: resultPromise } = await TextGeneration.generateStream(prompt, {
                maxTokens: 256,
                temperature: 0.7,
                top_p: 0.9,
                repeat_penalty: 1.1,
                context_length: 4096,
                n_batch: 'auto',
                systemPrompt,
                stopSequences: ['User:', '\n\n\n\n'],
            })

            const streamPromise = (async () => {
                for await (const token of stream) {
                    fullText += token
                    onToken?.(fullText)
                }
            })()

            await runWithTimeout(streamPromise, LLM_TIMEOUT_MS, 'LLM generation')

            // Wait for result metrics (non-critical, don't block)
            try {
                const res = await Promise.race([resultPromise, new Promise(r => setTimeout(r, 2000))])
                if (res && res.text) fullText = res.text
            } catch (e) { }
        } catch (err) {
            console.error('[LLM] Stream error:', err)
            // If we got partial text, use it; otherwise rethrow
            if (!fullText.trim()) {
                throw new Error('Response took too long. Please try again.')
            }
        }
    }

    const responseText = cleanLLMOutput(fullText)

    // Guard: never return empty
    if (!responseText) {
        throw new Error('Empty LLM response')
    }

    console.log('[LLM] generateResponse done, length:', responseText.length)

    return {
        text: responseText,
        parsed: parseTeachingResponse(responseText),
    }
}

// ─── Generate quiz ───────────────────────────────────────────────────────────
export async function generateQuiz(topic = 'random', signal) {
    console.log('[QUIZ] generateQuiz started:', { topic })

    const prompt = `Generate a quiz question. Topic: ${topic}\nOutput valid JSON:\n`
    let fullText = ''

    // ─── Try Worker first ────────────────────────────────────────────────────
    if (isWorkerAvailable()) {
        try {
            const result = await generateQuizViaWorker(prompt, {
                systemPrompt: QUIZ_SYSTEM_PROMPT,
                maxTokens: 150,
                temperature: 0.3, // Low temperature for consistent JSON
                stopSequences: [],
                timeoutMs: 7000,
            })
            // If the user cancelled, the worker call might throw or finish. We check signal:
            if (signal?.aborted) throw new Error('Aborted by user')
            fullText = result.text
        } catch (workerErr) {
            console.warn('[QUIZ] Worker failed, falling back:', workerErr.message)
            fullText = ''
        }
    }

    // ─── Fallback: main thread ───────────────────────────────────────────────
    if (!fullText.trim()) {
        try {
            if (signal?.aborted) throw new Error('Aborted by user')

            const { stream, result: resultPromise } = await TextGeneration.generateStream(prompt, {
                maxTokens: 150,
                temperature: 0.3,
                systemPrompt: QUIZ_SYSTEM_PROMPT,
                stopSequences: [],
            })

            const streamPromise = (async () => {
                for await (const token of stream) {
                    if (signal?.aborted) throw new Error('Aborted by user')
                    fullText += token
                }
            })()

            // Hard timeout for quiz generation (7 seconds)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('LLM timeout')), 7000)
            )

            const llmPromise = (async () => {
                await streamPromise;
                return fullText;
            })();

            const rawResponse = await Promise.race([llmPromise, timeoutPromise])
            if (signal?.aborted) throw new Error('Aborted by user')

            addDebugLog(DebugCategory.LLM, `Quiz raw response: ${rawResponse.substring(0, 100)}...`)

            try { await Promise.race([resultPromise, new Promise(r => setTimeout(r, 100))]) } catch (e) { }
            fullText = rawResponse;
        } catch (e) {
            console.error('[QUIZ] LLM error:', e)
            addDebugLog(DebugCategory.ERROR, `[QUIZ] Generation failed: ${e.message}. Using fallback.`)
            if (e.message === 'Aborted by user') throw e;

            return { isFallback: true, parsed: getRandomFallbackQuiz(topic) }
        }
    }

    const parsed = parseQuizResponse(fullText)
    addDebugLog(DebugCategory.LLM_OUTPUT, `Quiz JSON: ${fullText.slice(0, 300)}`)

    if (!parsed) {
        console.warn('[QUIZ] JSON Parse failed, using fallback quiz. Raw:', fullText.substring(0, 200))
        return { isFallback: true, parsed: getRandomFallbackQuiz(topic) }
    }

    console.log('[QUIZ] generateQuiz done:', parsed.questions?.[0]?.question?.substring(0, 50))
    return { isFallback: false, parsed: parsed.questions[0] }
}

function getRandomFallbackQuiz(topic) {
    if (topic && topic !== 'random') {
        const filtered = fallbackQuizzes.filter(q => q.topic === topic);
        if (filtered.length > 0) {
            return filtered[Math.floor(Math.random() * filtered.length)];
        }
    }
    return fallbackQuizzes[Math.floor(Math.random() * fallbackQuizzes.length)];
}

// ─── Parse quiz response ─────────────────────────────────────────────────────
export function parseQuizResponse(text) {
    try {
        if (!text) return null

        // Find JSON block if there is wrapper text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const data = JSON.parse(jsonMatch[0]);
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) return null;

        const q = data.questions[0];
        if (!q.question || !q.options || !q.answer || q.options.length < 2) return null;
        if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
            // Try to extract just the first letter if it's "A) something"
            q.answer = q.answer.charAt(0).toUpperCase();
        }

        return data;
    } catch {
        return null
    }
}

// ─── Generate speaking feedback ──────────────────────────────────────────────
export async function generateFeedback(userSentence) {
    console.log('[FEEDBACK] started:', userSentence?.substring(0, 50))

    const prompt = `Analyze this sentence spoken by a Hindi speaker: "${userSentence}"\nFeedback:`

    let fullText = ''

    try {
        const { stream, result: resultPromise } = await TextGeneration.generateStream(prompt, {
            maxTokens: 150,
            temperature: 0.5,
            systemPrompt: FEEDBACK_SYSTEM_PROMPT,
            stopSequences: ['\n\n\n'],
        })

        const streamPromise = (async () => {
            for await (const token of stream) {
                fullText += token
            }
        })()

        await runWithTimeout(streamPromise, LLM_TIMEOUT_MS, 'Feedback generation')
        try { await Promise.race([resultPromise, new Promise(r => setTimeout(r, 2000))]) } catch (e) { }
    } catch (err) {
        console.error('[FEEDBACK] error:', err)
        return { text: '', parsed: null }
    }

    console.log('[FEEDBACK] done')
    return { text: fullText.trim(), parsed: parseFeedback(fullText) }
}

// ─── Parse feedback response ─────────────────────────────────────────────────
export function parseFeedback(text) {
    try {
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
        const get = (prefix) => lines.find((l) => l.startsWith(prefix))?.replace(prefix, '').trim() || ''

        const fluency = parseInt(get('FLUENCY:') || '5')
        const corrected = get('CORRECTED:')
        const suggestion = get('SUGGESTION:')
        const mistake = get('MISTAKE:')
        const hindiTip = get('HINDI_TIP:')

        return {
            fluency: Math.min(10, Math.max(1, fluency)),
            corrected,
            suggestion,
            mistake,
            hindiTip,
        }
    } catch {
        return null
    }
}

// Export the timeout utility for use elsewhere
export { runWithTimeout }
