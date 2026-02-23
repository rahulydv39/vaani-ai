import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-badges">
                <span className="footer-badge">
                    <span className="footer-badge-icon">🔒</span>
                    Privacy
                </span>
                <span className="footer-divider">•</span>
                <span className="footer-badge">
                    <span className="footer-badge-icon">💰</span>
                    Zero API Cost
                </span>
                <span className="footer-divider">•</span>
                <span className="footer-badge">
                    <span className="footer-badge-icon">📡</span>
                    No Internet Required
                </span>
            </div>
            <p className="footer-credit">Powered by On-Device AI</p>
        </footer>
    );
}
