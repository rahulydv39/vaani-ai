import { useAppState } from '../store/appStore'
import { AppStatus } from '../store/appStore'

const STATUS_CONFIG = {
    [AppStatus.IDLE]: { label: 'Ready to Start', icon: '🔵', color: 'var(--color-info)' },
    [AppStatus.INITIALIZING]: { label: 'Loading AI model…', icon: '⚡', color: 'var(--color-warning)' },
    [AppStatus.DOWNLOADING]: { label: 'Downloading Models…', icon: '📥', color: 'var(--color-warning)' },
    [AppStatus.WARMING_UP]: { label: 'Warming up AI…', icon: '🔥', color: 'var(--color-warning)' },
    [AppStatus.READY]: { label: 'AI Ready', icon: '✅', color: 'var(--color-success)' },
    [AppStatus.LISTENING]: { label: 'Listening…', icon: '🎤', color: 'var(--color-accent)' },
    [AppStatus.PROCESSING_STT]: { label: 'Understanding speech…', icon: '📝', color: 'var(--color-warning)' },
    [AppStatus.THINKING]: { label: 'Thinking…', icon: '🧠', color: 'var(--color-purple)' },
    [AppStatus.SPEAKING]: { label: 'Speaking…', icon: '🔊', color: 'var(--color-teal)' },
    [AppStatus.ERROR]: { label: 'Error', icon: '❌', color: 'var(--color-error)' },
}

export function StatusBar() {
    const { status, downloadProgress, error, accelerationMode } = useAppState()
    const config = STATUS_CONFIG[status] || STATUS_CONFIG[AppStatus.IDLE]

    return (
        <div className="status-bar">
            <div className="status-left">
                <span className="status-dot" style={{ background: config.color }}>
                    {status === AppStatus.LISTENING && <span className="status-dot-pulse" />}
                </span>
                <span className="status-label">
                    {config.icon} {config.label}
                </span>
                {status === AppStatus.DOWNLOADING && (
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.round(downloadProgress * 100)}%` }}
                        />
                        <span className="progress-text">{Math.round(downloadProgress * 100)}%</span>
                    </div>
                )}
                {status === AppStatus.ERROR && error && (
                    <span className="status-error-text">{error}</span>
                )}
            </div>
            <div className="status-right">
                <span className="badge badge-device">
                    <span className="badge-dot" />
                    Runs fully on-device
                </span>
                {accelerationMode !== 'unknown' && (
                    <span className="badge badge-gpu">
                        {accelerationMode === 'webgpu' ? '⚡ WebGPU' : '🖥️ CPU'}
                    </span>
                )}
            </div>
        </div>
    )
}
