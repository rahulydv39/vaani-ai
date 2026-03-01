import { useState, useEffect, useCallback } from 'react'
import { useAppState, useAppActions, AppStatus } from '../store/appStore'

const NAV_ITEMS = [
    { id: 'conversation', icon: '\uD83D\uDCAC', label: 'Conversation' },
    { id: 'quiz', icon: '\uD83D\uDCDD', label: 'Quiz' },
    { id: 'grammar', icon: '\uD83D\uDCD8', label: 'Grammar' },
    { id: 'dictionary', icon: '\uD83D\uDCD6', label: 'Dictionary' },
    { id: 'history', icon: '\uD83D\uDD58', label: 'History' },
]

const BOTTOM_ITEMS = [
    { id: 'about', icon: '\u2139\uFE0F', label: 'About' },
    { id: 'contact', icon: '\uD83D\uDCDE', label: 'Contact' },
    { id: 'privacy', icon: '\uD83D\uDD12', label: 'Privacy' },
]

export function Sidebar({ conversations = [], activeConvId, onSelectConversation, onNewConversation }) {
    const { activeView, sidebarOpen, status } = useAppState()
    const { setActiveView, setSidebarOpen } = useAppActions()

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' && window.innerWidth < 768
    )

    // Responsive listener: auto-collapse on resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile && sidebarOpen) setSidebarOpen(false)
            if (!mobile && window.innerWidth >= 1024 && !sidebarOpen) setSidebarOpen(true)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [sidebarOpen, setSidebarOpen])

    const handleNav = useCallback((id) => {
        setActiveView(id)
        if (isMobile) setSidebarOpen(false)
    }, [isMobile, setActiveView, setSidebarOpen])

    const statusLabel = status === AppStatus.READY ? 'AI Ready' :
        status === AppStatus.DOWNLOADING ? 'Loading...' :
            status === AppStatus.INITIALIZING ? 'Starting...' :
                status === AppStatus.LISTENING ? 'Listening' :
                    status === AppStatus.TRANSCRIBING ? 'Transcribing' :
                        status === AppStatus.THINKING ? 'Thinking' :
                            status === AppStatus.SPEAKING ? 'Speaking' :
                                status === AppStatus.ERROR ? 'Error' : 'Offline'

    const statusColor = status === AppStatus.READY ? 'var(--color-success)' :
        status === AppStatus.ERROR ? 'var(--color-error)' : 'var(--color-amber)'

    return (
        <>
            {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-mark">V</div>
                    <div className="sidebar-brand-info">
                        <div className="sidebar-brand-name">Vaani AI</div>
                        <div className="sidebar-brand-tagline">English Tutor</div>
                    </div>
                </div>

                {/* AI Status indicator */}
                <div className="sidebar-status">
                    <span className="sidebar-status-dot" style={{ background: statusColor }} />
                    <span className="sidebar-status-label">{statusLabel}</span>
                </div>

                {/* Main nav */}
                <nav className="sidebar-nav">
                    <div className="sidebar-nav-label">LEARN</div>
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`sidebar-nav-item ${activeView === item.id ? 'sidebar-nav-active' : ''}`}
                            onClick={() => handleNav(item.id)}
                        >
                            <span className="sidebar-nav-icon">{item.icon}</span>
                            <span className="sidebar-nav-text">{item.label}</span>
                        </button>
                    ))}

                    {/* Chat History Inline */}
                    <div className="sidebar-nav-label" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>HISTORY</span>
                        <button
                            onClick={onNewConversation}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
                            title="New Conversation"
                        >
                            +
                        </button>
                    </div>
                    {conversations.slice(0, 5).map(conv => (
                        <button
                            key={conv.id}
                            className={`sidebar-nav-item sidebar-history-item ${activeConvId === conv.id && activeView === 'conversation' ? 'sidebar-nav-active' : ''}`}
                            onClick={() => {
                                onSelectConversation(conv.id)
                                if (isMobile) setSidebarOpen(false)
                            }}
                            title={conv.title}
                        >
                            <span className="sidebar-nav-icon">💬</span>
                            <span className="sidebar-nav-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
                                {conv.title}
                            </span>
                        </button>
                    ))}
                </nav>

                {/* Bottom nav */}
                <div className="sidebar-bottom">
                    <div className="sidebar-nav-label">MORE</div>
                    {BOTTOM_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`sidebar-nav-item sidebar-nav-small ${activeView === item.id ? 'sidebar-nav-active' : ''}`}
                            onClick={() => handleNav(item.id)}
                        >
                            <span className="sidebar-nav-icon">{item.icon}</span>
                            <span className="sidebar-nav-text">{item.label}</span>
                        </button>
                    ))}
                    <div className="sidebar-badge-row">
                        <span className="sidebar-mini-badge">On-Device</span>
                        <span className="sidebar-mini-badge">Private</span>
                    </div>
                </div>
            </aside>
        </>
    )
}
