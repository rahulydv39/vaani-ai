import { useState, useEffect, useCallback } from 'react'
import { useAppState, AppStatus } from '../store/appStore'
import { getDebugLogs, clearDebugLogs, subscribeDebugLogs, DebugCategory } from '../store/debugStore'

const CATEGORY_COLORS = {
    [DebugCategory.STT]: '#4fc3f7',
    [DebugCategory.LLM_INPUT]: '#81c784',
    [DebugCategory.LLM_OUTPUT]: '#aed581',
    [DebugCategory.STATE]: '#ffb74d',
    [DebugCategory.ERROR]: '#e57373',
    [DebugCategory.WORKER]: '#ba68c8',
    [DebugCategory.TTS]: '#4dd0e1',
}

export function DebugPanel({ visible }) {
    const appState = useAppState()
    const [logs, setLogs] = useState(() => getDebugLogs())

    useEffect(() => {
        const unsub = subscribeDebugLogs((newLogs) => setLogs([...newLogs]))
        return unsub
    }, [])

    const handleClear = useCallback(() => clearDebugLogs(), [])

    if (!visible) return null

    return (
        <div className="debug-panel">
            <div className="debug-header">
                <span className="debug-title">🔧 Debug Panel</span>
                <div className="debug-actions">
                    <span className="debug-state-badge">
                        State: <strong>{appState.status}</strong>
                    </span>
                    <button className="debug-clear-btn" onClick={handleClear}>Clear</button>
                </div>
            </div>

            <div className="debug-state-row">
                <span>Model: <strong>Qwen2.5-3B</strong></span>
                <span>Backend: <strong>{appState.hasWebGPU ? 'WebGPU' : 'WASM'}</strong></span>
                <span>Mode: <strong>{appState.mode}</strong></span>
                <span>TTS: <strong>{appState.ttsEnabled ? 'ON' : 'OFF'}</strong></span>
            </div>

            <div className="debug-logs">
                {logs.length === 0 && (
                    <div className="debug-empty">No logs yet. Speak or type to generate pipeline logs.</div>
                )}
                {logs.map((entry) => (
                    <div key={entry.id} className="debug-log-entry">
                        <span className="debug-time">{entry.timestamp}</span>
                        <span
                            className="debug-category"
                            style={{ color: CATEGORY_COLORS[entry.category] || '#aaa' }}
                        >
                            [{entry.category}]
                        </span>
                        <span className="debug-data">{entry.data}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
