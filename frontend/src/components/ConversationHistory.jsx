import './ConversationHistory.css';

export default function ConversationHistory({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="conv-history">
            <div className="conv-history-header">
                <span className="conv-history-icon">💭</span>
                <span className="conv-history-title">Previous Conversations</span>
            </div>

            <div className="conv-bubbles">
                {items.map((item) => (
                    <div key={item.id} className="conv-pair">
                        <div className="conv-bubble conv-coach">
                            <div className="bubble-tag">Coach</div>
                            <pre className="bubble-text">{item.text}</pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
