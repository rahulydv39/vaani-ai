import { AudioCapture, AudioPlayback, VAD, SpeechActivity, STT, TTS } from './aiEngine'
import { addDebugLog, DebugCategory } from '../store/debugStore'
import { generateResponse, detectLanguage } from './llm'

// ─── Voice session states ────────────────────────────────────────────────────
const VoiceState = {
    IDLE: 'idle',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    RESPONDING: 'responding',
}

let voiceState = VoiceState.IDLE
let activeMic = null
let activeVadUnsub = null
let sessionAbortController = null
let activeFinishRecording = null

// ─── Hard limits ─────────────────────────────────────────────────────────────
const MAX_RECORDING_MS = 20_000     // Max 20s hard cap
const SILENCE_TIMEOUT_MS = 1_200    // 1.2s silence → auto-stop
const SESSION_TIMEOUT_MS = 45_000   // 45s max session timeout
const STAGE_TIMEOUT_MS = 120_000    // Per-stage timeout (STT, LLM, TTS)
const MIN_SAMPLES = 1600            // ~100ms at 16kHz

function runWithTimeout(promise, ms, label) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
        promise
            .then((v) => { clearTimeout(timer); resolve(v) })
            .catch((e) => { clearTimeout(timer); reject(e) })
    })
}

// ─── Start voice session ─────────────────────────────────────────────────────
export async function startVoiceSession({
    systemPrompt,
    conversationHistory = [],
    maxTokens = 150,
    temperature = 0.7,
    ttsEnabled = true,
    onListening,
    onAudioLevel,
    onTranscribing,
    onTranscription,
    onThinking,
    onResponseToken,
    onResponseComplete,
    onSpeaking,
    onComplete,
    onError,
}) {
    // ─── Guard: prevent double mic start ─────────────────────────────────
    if (voiceState !== VoiceState.IDLE) {
        console.warn('[VOICE] Session already active, ignoring start')
        addDebugLog(DebugCategory.STATE, `Blocked start: state=${voiceState}`)
        return
    }

    // Clean up any leftover state
    stopVoiceSession()
    voiceState = VoiceState.LISTENING
    sessionAbortController = new AbortController()
    const signal = sessionAbortController.signal

    addDebugLog(DebugCategory.STATE, 'MIC_STARTED')

    const safeError = (err) => {
        console.error('[VOICE] Pipeline error:', err)
        addDebugLog(DebugCategory.ERROR, `Voice pipeline: ${err.message}`)
        voiceState = VoiceState.IDLE
        if (!signal.aborted) {
            try { onError?.(err) } catch (e) { console.error('[VOICE] onError threw:', e) }
        }
    }

    const safeComplete = () => {
        voiceState = VoiceState.IDLE
        if (!signal.aborted) {
            try { onComplete?.() } catch (e) { console.error('[VOICE] onComplete threw:', e) }
        }
    }

    // Helper: stop mic + VAD cleanly
    const stopRecording = () => {
        if (activeMic) {
            try { activeMic.stop() } catch (e) { /* ignore */ }
            activeMic = null
        }
        if (activeVadUnsub) {
            try { activeVadUnsub() } catch (e) { /* ignore */ }
            activeVadUnsub = null
        }
    }

    try {
        // ─── STEP 1: Start mic ───────────────────────────────────────────
        const mic = new AudioCapture({ sampleRate: 16000 })
        activeMic = mic
        VAD.reset()
        onListening?.()

        // ─── STEP 2: Wait for speech with VAD + hard timeouts ────────────
        // This promise resolves when we have audio samples to transcribe.
        const audioSamples = await new Promise((resolve, reject) => {
            let speechDetected = false
            let silenceTimer = null
            let maxRecordingTimer = null
            let sessionTimer = null
            let resolved = false

            // Cleanup all timers
            const cleanup = () => {
                if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null }
                if (maxRecordingTimer) { clearTimeout(maxRecordingTimer); maxRecordingTimer = null }
                if (sessionTimer) { clearTimeout(sessionTimer); sessionTimer = null }
            }

            // Resolve ONCE with collected audio
            const finishRecording = (reason) => {
                if (resolved) return
                resolved = true
                cleanup()
                addDebugLog(DebugCategory.STATE, reason)

                stopRecording()

                // Get whatever audio VAD has collected
                const segment = VAD.popSpeechSegment()
                if (segment && segment.samples.length >= MIN_SAMPLES) {
                    addDebugLog(DebugCategory.STATE, `Got ${segment.samples.length} samples`)
                    resolve(segment.samples)
                } else {
                    reject(new Error('No speech detected. Please try again.'))
                }
            }

            // Timeout: no speech at all within session timeout
            sessionTimer = setTimeout(() => {
                addDebugLog(DebugCategory.STATE, 'FORCE_STOP (session timeout)')
                finishRecording('FORCE_STOP: session timeout')
            }, SESSION_TIMEOUT_MS)

            // Expose manual finish
            activeFinishRecording = finishRecording

            // Abort signal listener
            signal.addEventListener('abort', () => {
                if (!resolved) {
                    resolved = true
                    cleanup()
                    stopRecording()
                    reject(new Error('Session aborted'))
                }
            }, { once: true })

            // VAD event handler
            activeVadUnsub = VAD.onSpeechActivity((activity) => {
                if (resolved || signal.aborted) return

                if (activity === SpeechActivity.Started) {
                    if (!speechDetected) {
                        speechDetected = true
                        addDebugLog(DebugCategory.STATE, 'SPEECH_DETECTED')

                        // Clear any pending silence timer
                        if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null }

                        // Start max recording timer (12s)
                        maxRecordingTimer = setTimeout(() => {
                            addDebugLog(DebugCategory.STATE, 'FORCE_STOP (max recording)')
                            finishRecording('FORCE_STOP: max recording 12s')
                        }, MAX_RECORDING_MS)
                    }
                }

                if (activity === SpeechActivity.Ended) {
                    addDebugLog(DebugCategory.STATE, 'VAD_SILENCE_DETECTED')

                    // Start silence timer — if no new speech within 1.2s, finish
                    if (silenceTimer) clearTimeout(silenceTimer)
                    silenceTimer = setTimeout(() => {
                        finishRecording('SILENCE_DETECTED → auto-stop')
                    }, SILENCE_TIMEOUT_MS)
                }
            })

            // Start mic and feed audio to VAD
            mic.start(
                (chunk) => {
                    if (!resolved && !signal.aborted) {
                        VAD.processSamples(chunk)
                    }
                },
                (level) => {
                    if (!resolved && !signal.aborted) {
                        onAudioLevel?.(level)
                    }
                }
            ).catch((micErr) => {
                if (!resolved) {
                    resolved = true
                    cleanup()
                    reject(micErr)
                }
            })
        })

        if (signal.aborted) return

        // ─── STEP 3: STT transcription ───────────────────────────────────
        voiceState = VoiceState.PROCESSING
        onTranscribing?.()

        let sttResult
        try {
            sttResult = await runWithTimeout(
                STT.transcribe(audioSamples, {
                    language: 'auto',
                    task: 'transcribe',
                }),
                STAGE_TIMEOUT_MS,
                'STT'
            )
        } catch (sttErr) {
            safeError(new Error('Speech recognition failed: ' + sttErr.message))
            return
        }

        if (signal.aborted) return
        const transcript = sttResult?.text?.trim() || ''

        if (!transcript) {
            safeError(new Error("Didn't catch that \u2014 try again"))
            return
        }

        const detectedLang = detectLanguage(transcript)
        addDebugLog(DebugCategory.STT, `Language: ${detectedLang}`)
        onTranscription?.(transcript, detectedLang)

        // ─── STEP 4: LLM generation ─────────────────────────────────────
        if (signal.aborted) return
        voiceState = VoiceState.RESPONDING
        onThinking?.()


        let responseText = ''
        let parsed = null

        const onTokenFn = (acc) => {
            if (!signal.aborted) onResponseToken?.(acc, acc)
        }

        try {
            // First attempt with 10s timeout and 2-turn history
            const smallHistory = conversationHistory.slice(-2)
            const result = await Promise.race([
                generateResponse(transcript, smallHistory, onTokenFn, detectedLang),
                new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT_10S')), 10000))
            ])
            responseText = result.text
            parsed = result.parsed
        } catch (e) {
            if (e.message === 'TIMEOUT_10S') {
                // Retry with minimal context
                const microHistory = conversationHistory.slice(-1)
                const result = await generateResponse(transcript, microHistory, onTokenFn, detectedLang)
                responseText = result.text
                parsed = result.parsed
            } else {
                throw e
            }
        }

        if (signal.aborted) return
        responseText = responseText.trim()

        if (!responseText) {
            safeError(new Error('Empty AI response'))
            return
        }

        onResponseComplete?.(responseText)

        // ─── STEP 5: TTS ─────────────────────────────────────────────────
        if (ttsEnabled && responseText) {
            if (signal.aborted) { safeComplete(); return }
            onSpeaking?.()
            addDebugLog(DebugCategory.TTS, 'TTS_START')

            try {
                const playSequence = async (text, modelId) => {
                    if (!text || signal.aborted) return
                    const ttsResult = await runWithTimeout(
                        TTS.synthesize(text, { modelId, speed: 1.0 }),
                        STAGE_TIMEOUT_MS,
                        'TTS'
                    )
                    if (!signal.aborted && ttsResult?.audioData) {
                        const player = new AudioPlayback({ sampleRate: ttsResult.sampleRate || 22050 })
                        await player.play(ttsResult.audioData, ttsResult.sampleRate || 22050)
                        player.dispose()
                    }
                }

                if (parsed) {
                    const engText = parsed.english || parsed.better_sentence || parsed.your_sentence
                    if (engText) await playSequence(engText, 'vits-piper-en_US-lessac-medium')

                    const hiText = parsed.hindi_explanation
                    if (hiText) await playSequence(hiText, 'vits-piper-hi_IN-swara-medium')
                } else {
                    const englishPortion = extractEnglishForTTS(responseText)
                    if (englishPortion) await playSequence(englishPortion, 'vits-piper-en_US-lessac-medium')
                }
            } catch (e) {
                console.warn('[TTS] Error (non-fatal):', e)
                addDebugLog(DebugCategory.TTS, `TTS error (non-fatal): ${e.message}`)
            }
        }

        safeComplete()
    } catch (err) {
        stopRecording()
        safeError(err)
    }
}

// ─── Stop session ────────────────────────────────────────────────────────────
export function stopVoiceSession() {
    if (sessionAbortController) {
        sessionAbortController.abort()
        sessionAbortController = null
    }
    if (activeMic) {
        try { activeMic.stop() } catch (e) { }
        activeMic = null
    }
    if (activeVadUnsub) {
        try { activeVadUnsub() } catch (e) { }
        activeVadUnsub = null
    }
    activeFinishRecording = null
    voiceState = VoiceState.IDLE
}

export function isSessionActive() {
    return voiceState !== VoiceState.IDLE
}

export function finishListening() {
    if (activeFinishRecording) {
        activeFinishRecording('USER_STOPPED_LISTENING')
    }
}

// Legacy detectLanguage removed, imported from llm.js

// ─── Extract English portion for TTS ─────────────────────────────────────────
function extractEnglishForTTS(text) {
    const englishMatch = text.match(/English:\s*(.+?)(?:\n(?:Hindi|Teaching|Next)|$)/si)
    if (englishMatch) return englishMatch[1].trim()

    const lines = text.split('\n').filter((l) => !/[\u0900-\u097F]/.test(l) && l.trim())
    return lines.join(' ').trim().substring(0, 300) || text.substring(0, 300)
}
