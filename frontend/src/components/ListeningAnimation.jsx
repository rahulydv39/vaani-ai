import './ListeningAnimation.css';

export default function ListeningAnimation() {
    return (
        <div className="listening-waveform">
            {[...Array(7)].map((_, i) => (
                <span
                    key={i}
                    className="waveform-bar"
                    style={{ animationDelay: `${i * 0.1}s` }}
                ></span>
            ))}
        </div>
    );
}
