import { useAppState, useAppActions } from '../store/appStore'

const MODES = [
    { id: 'casual', icon: '\uD83D\uDCAC', label: 'Casual' },
    { id: 'interview', icon: '\uD83D\uDCBC', label: 'Interview' },
    { id: 'speaking', icon: '\uD83C\uDFA4', label: 'Speaking' },
]

export function ModeSwitcher() {
    const { mode } = useAppState()
    const { setMode } = useAppActions()

    return (
        <div className="mode-switcher">
            {MODES.map(m => (
                <button
                    key={m.id}
                    className={`mode-btn ${mode === m.id ? 'mode-btn-active' : ''}`}
                    onClick={() => setMode(m.id)}
                >
                    <span className="mode-icon">{m.icon}</span>
                    <span className="mode-label">{m.label}</span>
                </button>
            ))}
        </div>
    )
}
