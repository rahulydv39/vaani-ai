export function ContactView() {
    return (
        <div className="content-view info-view">
            <div className="view-header">
                <h2 className="view-title">Contact Us</h2>
                <p className="view-subtitle">We would love to hear your feedback</p>
            </div>

            <div className="contact-content">
                <div className="info-card contact-card">
                    <div className="info-card-icon">{'\uD83D\uDCE7'}</div>
                    <h3>Email</h3>
                    <a href="mailto:hello@vaani.ai" className="contact-email">hello@vaani.ai</a>
                    <p>Send us your feedback, suggestions, or bug reports. We typically respond within 24 hours.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83D\uDCAC'}</div>
                    <h3>Feedback</h3>
                    <p>Vaani AI is constantly improving. Your feedback helps us build a better English learning experience for millions of Hindi speakers worldwide.</p>
                    <p>Tell us what features you would like to see, what works well, and what could be improved.</p>
                </div>

                <div className="info-card">
                    <div className="info-card-icon">{'\uD83D\uDE80'}</div>
                    <h3>Open Source</h3>
                    <p>Vaani AI is built with open-source technologies. We believe in making quality English education accessible to everyone, everywhere.</p>
                </div>
            </div>
        </div>
    )
}
