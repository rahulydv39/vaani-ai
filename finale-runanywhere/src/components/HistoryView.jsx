import * as chatStore from '../store/chatStore'

function formatTime(ts) {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function HistoryView({ onLoadConversation }) {
    const conversations = chatStore.loadConversations()

    return (
        <div className="content-view history-view">
            <div className="view-header">
                <h2 className="view-title">Conversation History</h2>
                <p className="view-subtitle">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''} saved</p>
            </div>

            {conversations.length === 0 ? (
                <div className="history-empty">
                    <span className="history-empty-icon">{'\uD83D\uDCAC'}</span>
                    <h3>No conversations yet</h3>
                    <p>Start a conversation to see your history here.</p>
                </div>
            ) : (
                <div className="history-list">
                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            className="history-item"
                            onClick={() => onLoadConversation?.(conv.id)}
                        >
                            <div className="history-item-icon">{'\uD83D\uDCAC'}</div>
                            <div className="history-item-info">
                                <div className="history-item-title">{conv.title || 'Untitled'}</div>
                                <div className="history-item-meta">
                                    {conv.messages?.length || 0} messages &middot; {formatTime(conv.updatedAt)}
                                </div>
                            </div>
                            <div className="history-item-arrow">{'\u203A'}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
