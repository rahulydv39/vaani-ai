import './ProcessingState.css';

export default function ProcessingState() {
    return (
        <div className="processing-state">
            <div className="processing-brain">🧠</div>
            <div className="processing-text">
                Thinking on device
                <span className="processing-dots">
                    <span className="p-dot" style={{ animationDelay: '0s' }}>.</span>
                    <span className="p-dot" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="p-dot" style={{ animationDelay: '0.4s' }}>.</span>
                </span>
            </div>
        </div>
    );
}
