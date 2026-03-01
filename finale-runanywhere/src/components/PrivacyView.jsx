export function PrivacyView() {
    return (
        <div className="content-view info-view">
            <div className="view-header">
                <h2 className="view-title">Privacy Policy</h2>
                <p className="view-subtitle">Your data stays on your device</p>
            </div>

            <div className="privacy-content">
                <div className="info-card">
                    <div className="info-card-icon">{'\uD83D\uDD12'}</div>
                    <h3>No Cloud Processing</h3>
                    <p>All AI processing happens locally on your device. Your conversations, voice input, and quiz responses are never sent to any server. The AI models run entirely in your browser using WebGPU.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83D\uDEAB'}</div>
                    <h3>No Data Collection</h3>
                    <p>We do not collect, store, or process any personal data. There are no analytics trackers, no cookies for tracking, and no third-party data sharing. Your learning journey is entirely private.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83D\uDCBE'}</div>
                    <h3>Local Storage Only</h3>
                    <p>Your conversation history and quiz scores are stored in your browser's local storage. This data never leaves your device. You can clear it at any time by clearing your browser data.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83C\uDF10'}</div>
                    <h3>Network Usage</h3>
                    <p>The only network activity is the initial download of AI models (approximately 400MB). After download, models are cached locally and the app works completely offline. No data is transmitted during conversations.</p>
                </div>
            </div>
        </div>
    )
}
