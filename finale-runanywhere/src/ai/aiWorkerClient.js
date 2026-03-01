/**
 * AI Worker Client — Main-thread bridge to the AI Web Worker.
 *
 * SINGLETON: initAIWorker() can be called multiple times safely.
 * It always returns the same promise and NEVER re-creates the worker.
 * On failure, it resolves false once → caller falls back to main thread.
 */

import { addDebugLog, DebugCategory } from '../store/debugStore'

let worker = null
let workerReady = false
let workerFailed = false
let initPromise = null        // ← NEVER cleared after first call
const pendingRequests = new Map()

// ─── Initialize the worker (singleton) ───────────────────────────────────────
export function initAIWorker() {
    // Already initializing or done — return same promise
    if (initPromise) return initPromise

    addDebugLog(DebugCategory.WORKER, 'AI_INIT_STARTED')

    initPromise = new Promise((resolve) => {
        try {
            worker = new Worker('/ai.worker.js', { type: 'module' })

            worker.onmessage = handleWorkerMessage

            worker.onerror = (err) => {
                console.error('[AIWorkerClient] Worker error:', err)
                addDebugLog(DebugCategory.WORKER, `AI_INIT_FAILED: ${err.message}`)
                workerFailed = true
                // DO NOT clear initPromise — stays set so no retry loop
                resolve(false)
            }

            worker.postMessage({ type: 'INIT' })

            // 180s timeout — resolves false once, does NOT loop
            const timeout = setTimeout(() => {
                if (!workerReady) {
                    console.warn('[AIWorkerClient] Worker init timed out after 180s')
                    addDebugLog(DebugCategory.WORKER, 'AI_INIT_FAILED: timeout after 180s')
                    workerFailed = true
                    resolve(false)
                }
            }, 180_000)

            pendingRequests.set('__INIT__', { resolve, timeout })
        } catch (err) {
            console.error('[AIWorkerClient] Failed to create worker:', err)
            addDebugLog(DebugCategory.WORKER, `AI_INIT_FAILED: ${err.message}`)
            workerFailed = true
            resolve(false)
        }
    })

    return initPromise
}

// ─── Handle messages from the worker ─────────────────────────────────────────
function handleWorkerMessage(e) {
    const msg = e.data

    switch (msg.type) {
        case 'INIT_OK': {
            workerReady = true
            addDebugLog(DebugCategory.WORKER, 'WORKER_READY')
            addDebugLog(DebugCategory.WORKER, 'AI_INIT_SUCCESS')
            const init = pendingRequests.get('__INIT__')
            if (init) {
                clearTimeout(init.timeout)
                init.resolve(true)
                pendingRequests.delete('__INIT__')
            }
            break
        }
        case 'INIT_FAIL': {
            workerFailed = true
            // DO NOT clear initPromise — singleton must stay set
            addDebugLog(DebugCategory.WORKER, `AI_INIT_FAILED: ${msg.error}`)
            const init = pendingRequests.get('__INIT__')
            if (init) {
                clearTimeout(init.timeout)
                init.resolve(false)
                pendingRequests.delete('__INIT__')
            }
            break
        }
        case 'TOKEN': {
            const req = pendingRequests.get(msg.id)
            if (req?.onToken) req.onToken(msg.token, msg.accumulated)
            break
        }
        case 'DONE': {
            const req = pendingRequests.get(msg.id)
            if (req) {
                clearTimeout(req.timeout)
                req.resolve({ text: msg.text })
                pendingRequests.delete(msg.id)
            }
            break
        }
        case 'ERROR': {
            const req = pendingRequests.get(msg.id)
            if (req) {
                clearTimeout(req.timeout)
                req.reject(new Error(msg.error))
                pendingRequests.delete(msg.id)
            }
            break
        }
    }
}

// ─── Check if worker is available ────────────────────────────────────────────
export function isWorkerAvailable() {
    return workerReady && !workerFailed
}

// ─── Generate text via the worker ────────────────────────────────────────────
export function generateViaWorker(prompt, options = {}, onToken) {
    const {
        systemPrompt = '',
        maxTokens = 120,
        temperature = 0.6,
        stopSequences = ['User:', '\n\n\n\n'],
        timeoutMs = 30_000,
    } = options

    const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            worker?.postMessage({ type: 'ABORT', id })
            pendingRequests.delete(id)
            reject(new Error('Response took too long. Please try again.'))
        }, timeoutMs)

        pendingRequests.set(id, {
            resolve,
            reject,
            timeout,
            onToken: (token, accumulated) => {
                onToken?.(accumulated)
            },
        })

        worker.postMessage({
            type: 'GENERATE',
            id,
            prompt,
            systemPrompt,
            maxTokens,
            temperature,
            stopSequences,
        })
    })
}

// ─── Generate quiz via the worker ────────────────────────────────────────────
export function generateQuizViaWorker(prompt, options = {}) {
    return generateViaWorker(prompt, { ...options, timeoutMs: 20_000 })
}

// ─── Abort all pending requests ──────────────────────────────────────────────
export function abortAllWorkerRequests() {
    for (const [id, req] of pendingRequests.entries()) {
        if (id === '__INIT__') continue
        clearTimeout(req.timeout)
        worker?.postMessage({ type: 'ABORT', id })
        req.reject(new Error('Aborted'))
    }
    for (const id of pendingRequests.keys()) {
        if (id !== '__INIT__') pendingRequests.delete(id)
    }
}
