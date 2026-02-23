import './MicButton.css';

export default function MicButton({ status, onClick, disabled }) {
    const isListening = status === 'listening';
    const isIdle = status === 'idle' || status === 'result' || status === 'error';

    return (
        <div className="mic-container">
            {/* Ripple rings when listening */}
            {isListening && (
                <>
                    <span className="mic-ripple mic-ripple-1"></span>
                    <span className="mic-ripple mic-ripple-2"></span>
                    <span className="mic-ripple mic-ripple-3"></span>
                </>
            )}

            {/* Idle pulse ring */}
            {isIdle && <span className="mic-idle-ring"></span>}

            <button
                className={`mic-button ${isListening ? 'mic-listening' : ''} ${isIdle ? 'mic-idle' : ''}`}
                onClick={onClick}
                disabled={disabled}
                aria-label={isListening ? 'Recording…' : 'Start recording'}
            >
                <svg
                    className="mic-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="9" y="1" width="6" height="13" rx="3" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            </button>
        </div>
    );
}
