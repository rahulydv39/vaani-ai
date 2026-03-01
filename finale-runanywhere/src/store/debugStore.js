// ─── Debug Store — in-memory log for pipeline visibility ─────────────────────

const MAX_LOGS = 100
let logs = []
let listeners = []

export const DebugCategory = {
    STT: 'STT',
    LLM_INPUT: 'LLM_INPUT',
    LLM_OUTPUT: 'LLM_OUTPUT',
    STATE: 'STATE',
    ERROR: 'ERROR',
    WORKER: 'WORKER',
    TTS: 'TTS',
}

export function addDebugLog(category, data) {
    const entry = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        category,
        data: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
    logs = [entry, ...logs].slice(0, MAX_LOGS)
    listeners.forEach((fn) => fn(logs))
    return entry
}

export function getDebugLogs() {
    return logs
}

export function clearDebugLogs() {
    logs = []
    listeners.forEach((fn) => fn(logs))
}

export function subscribeDebugLogs(listener) {
    listeners.push(listener)
    return () => {
        listeners = listeners.filter((fn) => fn !== listener)
    }
}
