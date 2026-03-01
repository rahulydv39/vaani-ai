import { useAppState, useAppActions, AppStatus } from '../store/appStore'

const VIEW_TITLES = {
    conversation: 'Conversation',
    quiz: 'Quiz',
    grammar: 'Grammar',
    dictionary: 'Dictionary',
    history: 'History',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy',
}

export function Header() {
    const { sidebarOpen, activeView, status, downloadProgress, accelerationMode, ttsEnabled } = useAppState()
    const { setSidebarOpen, setTtsEnabled } = useAppActions()

    const isLoading = status === AppStatus.INITIALIZING || status === AppStatus.DOWNLOADING

    return (
        <header className="app-header">
            <div className="header-left">
                <button
                    className="header-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title="Toggle sidebar"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <h1 className="header-title">{VIEW_TITLES[activeView] || 'Vaani AI'}</h1>
            </div>

            <div className="header-center">
                <span className="header-brand">Vaani AI</span>
            </div>

            <div className="header-right">
                {isLoading && (
                    <div className="header-progress">
                        <div className="header-progress-bar" style={{ width: `${Math.round(downloadProgress * 100)}%` }} />
                        <span className="header-progress-text">
                            {status === AppStatus.INITIALIZING ? 'Starting...' : `${Math.round(downloadProgress * 100)}%`}
                        </span>
                    </div>
                )}

                <span className="header-pill header-pill-device">
                    <span className="header-pill-dot" />
                    On-device
                </span>

                {accelerationMode === 'webgpu' && (
                    <span className="header-pill header-pill-gpu">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        WebGPU
                    </span>
                )}

                {status !== AppStatus.IDLE && (
                    <button
                        className={`header-tts-btn ${ttsEnabled ? 'header-tts-on' : ''}`}
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        title={ttsEnabled ? 'TTS on' : 'TTS off'}
                    >
                        {ttsEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07'}
                    </button>
                )}
            </div>
        </header>
    )
}
