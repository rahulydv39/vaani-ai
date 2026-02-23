import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-brand">
                    <h1 className="header-title">
                        <span className="header-icon">✦</span>
                        Vaani <span className="gradient-text">AI</span>
                    </h1>
                    <p className="header-subtitle">Offline English Tutor</p>
                </div>
                <div className="badge">
                    <span className="badge-dot"></span>
                    100% On-Device
                </div>
            </div>
        </header>
    );
}
