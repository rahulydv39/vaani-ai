import { useAppState, AppStatus } from '../store/appStore'

export function MicButton({ onStart, onStop, disabled }) {
    const { status, audioLevel } = useAppState()
    const isListening = status === AppStatus.LISTENING
    const isProcessing = status === AppStatus.THINKING || status === AppStatus.SPEAKING
    const isDisabled = disabled || isProcessing || status === AppStatus.IDLE || status === AppStatus.INITIALIZING || status === AppStatus.DOWNLOADING

    const handleClick = () => {
        if (isDisabled) return
        if (isListening) {
            onStop?.()
        } else {
            onStart?.()
        }
    }

    return (
        <button
            className={`mic-button ${isListening ? 'mic-listening' : ''} ${isProcessing ? 'mic-processing' : ''}`}
            onClick={handleClick}
            disabled={isDisabled}
            title={isListening ? 'Stop recording' : 'Start recording'}
            id="mic-button"
        >
            {isListening && (
                <>
                    <span className="mic-ring mic-ring-1" style={{ transform: `scale(${1 + audioLevel * 0.5})` }} />
                    <span className="mic-ring mic-ring-2" style={{ transform: `scale(${1 + audioLevel * 0.8})` }} />
                    <span className="mic-ring mic-ring-3" />
                </>
            )}

            <span className="mic-icon">
                {isListening ? '⏹️' : isProcessing ? '⏳' : '🎤'}
            </span>

            <span className="mic-label">
                {isListening ? 'Tap to stop' : isProcessing ? 'Processing…' : 'Tap to speak'}
            </span>
        </button>
    )
}
