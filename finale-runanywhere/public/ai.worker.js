/**
 * AI Worker — Runs LLM inference off the main thread.
 *
 * The RunAnywhere SDK must be initialized inside the worker scope.
 * This worker handles:
 *   - SDK + model initialization
 *   - LLM text generation (streaming tokens back)
 *   - Timeout enforcement
 *
 * Messages IN:
 *   { type: 'INIT' }
 *   { type: 'GENERATE', id, prompt, systemPrompt, maxTokens, temperature, stopSequences }
 *   { type: 'GENERATE_QUIZ', id, prompt, systemPrompt, maxTokens, temperature, stopSequences }
 *   { type: 'ABORT', id }
 *
 * Messages OUT:
 *   { type: 'INIT_OK' }
 *   { type: 'INIT_FAIL', error }
 *   { type: 'TOKEN', id, token, accumulated }
 *   { type: 'DONE', id, text }
 *   { type: 'ERROR', id, error }
 */

import { RunAnywhere, SDKEnvironment, ModelManager, ModelCategory, LLMFramework, EventBus } from '@runanywhere/web'
import { LlamaCPP } from '@runanywhere/web-llamacpp'
import { TextGeneration } from '@runanywhere/web-llamacpp'

let initialized = false
let activeAbortMap = new Map()

const MODELS = [
    {
        id: 'qwen2.5-1.5b-instruct-q4_k_m',
        repo: 'Qwen/Qwen2.5-1.5B-Instruct-GGUF',
        files: ['qwen2.5-1.5b-instruct-q4_k_m.gguf'],
        framework: LLMFramework.LlamaCpp,
        modality: ModelCategory.Language,
        memoryRequirement: 1_200_000_000,
    },
]

async function initWorker() {
    if (initialized) {
        self.postMessage({ type: 'INIT_OK' })
        return
    }
    try {
        await RunAnywhere.initialize({
            environment: SDKEnvironment.Development,
            debug: false,
        })
        await LlamaCPP.register()
        RunAnywhere.registerModels(MODELS)

        // Download + load LLM model
        for (const model of MODELS) {
            try {
                const models = ModelManager.getModels()
                const m = models.find((x) => x.id === model.id)
                if (m && (m.status === 'downloaded' || m.status === 'loaded')) continue
            } catch (e) { /* not available */ }
            await ModelManager.downloadModel(model.id)
        }
        for (const model of MODELS) {
            await ModelManager.loadModel(model.id, { coexist: true, contextLength: 4096 })
        }

        // Warm up the model with a tiny prompt so it's snappy for the first real query
        try {
            console.log('[AI Worker] Warming up model...')
            const { stream, result: resultPromise } = await TextGeneration.generateStream("Hello", {
                maxTokens: 5,
                temperature: 0.1,
            })
            for await (const token of stream) { /* consume */ }
            await resultPromise;
            console.log('[AI Worker] Warmup complete!')
        } catch (e) {
            console.warn('[AI Worker] Warmup skipped/failed:', e.message)
        }

        initialized = true
        self.postMessage({ type: 'INIT_OK' })
    } catch (err) {
        self.postMessage({ type: 'INIT_FAIL', error: err.message || 'Worker init failed' })
    }
}

async function generate(msg) {
    const { id, prompt, systemPrompt, maxTokens = 256, temperature = 0.7, top_p = 0.9, repeat_penalty = 1.1, stopSequences = ['User:', '\n\n\n'] } = msg
    let fullText = ''
    const abortController = new AbortController()
    activeAbortMap.set(id, abortController)

    try {
        const { stream, result: resultPromise } = await TextGeneration.generateStream(prompt, {
            maxTokens,
            temperature,
            top_p,
            repeat_penalty,
            systemPrompt,
            stopSequences,
        })

        for await (const token of stream) {
            if (abortController.signal.aborted) break
            fullText += token
            self.postMessage({ type: 'TOKEN', id, token, accumulated: fullText })
        }

        // Wait briefly for result metrics
        try {
            const res = await Promise.race([resultPromise, new Promise((r) => setTimeout(r, 2000))])
            if (res && res.text) fullText = res.text
        } catch (e) { /* ignore */ }

        if (!abortController.signal.aborted) {
            self.postMessage({ type: 'DONE', id, text: fullText.trim() })
        }
    } catch (err) {
        if (fullText.trim()) {
            self.postMessage({ type: 'DONE', id, text: fullText.trim() })
        } else {
            self.postMessage({ type: 'ERROR', id, error: err.message || 'Generation failed' })
        }
    } finally {
        activeAbortMap.delete(id)
    }
}

function abortGeneration(id) {
    const controller = activeAbortMap.get(id)
    if (controller) {
        controller.abort()
        activeAbortMap.delete(id)
    }
}

self.onmessage = async (e) => {
    const msg = e.data
    switch (msg.type) {
        case 'INIT':
            await initWorker()
            break
        case 'GENERATE':
        case 'GENERATE_QUIZ':
            await generate(msg)
            break
        case 'ABORT':
            abortGeneration(msg.id)
            break
        default:
            console.warn('[AI Worker] Unknown message type:', msg.type)
    }
}
