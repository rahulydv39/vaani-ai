/**
 * aiEngine.js — GLOBAL AI SINGLETON
 *
 * One module owns the entire AI lifecycle.
 * Call initAI() once on app start. All other modules import helpers from here.
 * NEVER re-initializes automatically. NEVER restarts on tab switch or mic click.
 */

import { RunAnywhere, SDKEnvironment, ModelManager, ModelCategory, LLMFramework, EventBus } from '@runanywhere/web'
import { LlamaCPP } from '@runanywhere/web-llamacpp'
import { ONNX, AudioCapture, AudioPlayback, VAD, SpeechActivity, STT, TTS } from '@runanywhere/web-onnx'

// ─── Model catalog ────────────────────────────────────────────────────────────
const MODELS = [
    {
        id: 'silero-vad-v5',
        url: 'https://huggingface.co/runanywhere/silero-vad-v5/resolve/main/silero_vad.onnx',
        files: ['silero_vad.onnx'],
        framework: LLMFramework.ONNX,
        modality: ModelCategory.Audio,
        memoryRequirement: 5_000_000,
    },
    {
        id: 'sherpa-onnx-whisper-base',
        url: 'https://huggingface.co/runanywhere/sherpa-onnx-whisper-base/resolve/main/sherpa-onnx-whisper-base.tar.gz',
        framework: LLMFramework.ONNX,
        modality: ModelCategory.SpeechRecognition,
        memoryRequirement: 250_000_000,
        artifactType: 'archive',
    },
    {
        id: 'qwen2.5-3b-instruct-q4_k_m',
        repo: 'Qwen/Qwen2.5-3B-Instruct-GGUF',
        files: ['qwen2.5-3b-instruct-q4_k_m.gguf'],
        framework: LLMFramework.LlamaCpp,
        modality: ModelCategory.Language,
        memoryRequirement: 2_500_000_000,
    },
    {
        id: 'vits-piper-en_US-lessac-medium',
        url: 'https://huggingface.co/runanywhere/vits-piper-en_US-lessac-medium/resolve/main/vits-piper-en_US-lessac-medium.tar.gz',
        framework: LLMFramework.ONNX,
        modality: ModelCategory.SpeechSynthesis,
        memoryRequirement: 65_000_000,
        artifactType: 'archive',
    },
    {
        id: 'vits-piper-hi_IN-swara-medium',
        url: 'https://huggingface.co/runanywhere/vits-piper-hi_IN-swara-medium/resolve/main/vits-piper-hi_IN-swara-medium.tar.gz',
        framework: LLMFramework.ONNX,
        modality: ModelCategory.SpeechSynthesis,
        memoryRequirement: 65_000_000,
        artifactType: 'archive',
    },
]

const MODEL_IDS = MODELS.map((m) => m.id)

// ─── Singleton state ─────────────────────────────────────────────────────────
let _initPromise = null   // Set once. NEVER cleared.
let _initialized = false  // True after successful init

/**
 * initAI — one-time initialization. Safe to call multiple times; always
 * returns the same promise. Does NOT restart on failure.
 *
 * @param {function} onProgress - progress callback (0–1)
 * @returns {Promise<boolean>} true on success, throws on fatal error
 */
export async function initAI(onProgress) {
    if (_initPromise) return _initPromise

    _initPromise = (async () => {
        console.log('[AI] initAI started')

        // 1. Register SDK
        await RunAnywhere.initialize({
            environment: SDKEnvironment.Development,
            debug: false,
        })
        await LlamaCPP.register()
        await ONNX.register()
        RunAnywhere.registerModels(MODELS)

        // 2. Download (skip already-downloaded)
        const progressMap = {}
        const unsub = EventBus.shared.on('model.downloadProgress', (evt) => {
            progressMap[evt.modelId] = evt.progress ?? 0
            const total = MODEL_IDS.reduce((s, id) => s + (progressMap[id] || 0), 0) / MODEL_IDS.length
            onProgress?.(total)
        })

        for (const id of MODEL_IDS) {
            try {
                const models = ModelManager.getModels()
                const m = models.find((m) => m.id === id)
                if (m && (m.status === 'downloaded' || m.status === 'loaded')) {
                    progressMap[id] = 1
                    continue
                }
            } catch (_) { /* skip */ }
            await ModelManager.downloadModel(id)
            progressMap[id] = 1
        }
        if (typeof unsub === 'function') unsub()
        onProgress?.(1)

        // 3. Load all models once
        for (const id of MODEL_IDS) {
            await ModelManager.loadModel(id, { coexist: true })
        }

        _initialized = true
        console.log('[AI] initAI complete — all models loaded')
        return true
    })()

    return _initPromise
}

/** True only after initAI() resolves successfully */
export function isAIReady() { return _initialized }

/** WebGPU availability check */
export function checkWebGPU() { return !!navigator.gpu }

/** LlamaCPP acceleration mode */
export function getAccelerationMode() {
    try { if (LlamaCPP.isRegistered) return LlamaCPP.accelerationMode } catch (_) { }
    return 'cpu'
}

// Re-export SDK primitives that other modules need
export { ModelManager, EventBus, AudioCapture, AudioPlayback, VAD, SpeechActivity, STT, TTS }

/**
 * Speak text in English using Piper TTS.
 * @param {string} text — English text to synthesize
 */
export async function speakEnglish(text) {
    if (!text) return
    try {
        const result = await TTS.synthesize(text, { speed: 1.0 })
        if (result?.audioData) {
            const player = new AudioPlayback({ sampleRate: result.sampleRate || 22050 })
            await player.play(result.audioData, result.sampleRate || 22050)
            player.dispose()
        }
    } catch (e) {
        console.warn('[aiEngine] TTS error:', e)
    }
}
