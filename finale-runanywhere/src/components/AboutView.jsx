export function AboutView() {
    return (
        <div className="content-view info-view">
            <div className="view-header">
                <h2 className="view-title">About Vaani AI</h2>
                <p className="view-subtitle">Your personal English tutor</p>
            </div>

            <div className="info-cards">
                <div className="info-card">
                    <div className="info-card-icon">{'\uD83E\uDDE0'}</div>
                    <h3>On-Device AI</h3>
                    <p>Vaani AI runs entirely on your device using WebGPU acceleration. No internet connection needed after the initial model download. Your conversations are processed locally, making the experience fast and private.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83D\uDD12'}</div>
                    <h3>Privacy First</h3>
                    <p>Your conversations never leave your device. There are no cloud servers, no data collection, and no tracking. Everything stays on your browser, giving you complete control over your data.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83D\uDCF6'}</div>
                    <h3>Works Offline</h3>
                    <p>Once the AI models are downloaded and cached, Vaani AI works completely offline. Practice your English anywhere, anytime, without needing Wi-Fi or mobile data.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83C\uDDEE\uD83C\uDDF3'}</div>
                    <h3>Built for Hindi Speakers</h3>
                    <p>Vaani AI understands Hindi, English, and Hinglish. Speak naturally in your preferred language and receive structured English teaching responses with Hindi translations and tips.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83C\uDFAF'}</div>
                    <h3>Adaptive Learning</h3>
                    <p>The quiz system automatically adjusts difficulty based on your performance. Grammar lessons cover essential topics from tenses to modal verbs, with real examples for every concept.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\u26A1'}</div>
                    <h3>Powered by RunAnywhere</h3>
                    <p>Built on the RunAnywhere Web SDK, Vaani AI leverages WebGPU for fast inference. The LLM, speech-to-text, and text-to-speech models all run natively in your browser.</p>
                </div>
            </div>
        </div>
    )
}
