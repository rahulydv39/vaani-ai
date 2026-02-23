import { useState, useEffect } from 'react';
import './CoachResponseCard.css';

function TypedText({ text, speed = 16 }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!text) return;
        setDisplayed('');
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                setDone(true);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span>
            {displayed}
            {!done && <span className="typing-cursor">|</span>}
        </span>
    );
}

export default function CoachResponseCard({ response }) {
    if (!response) return null;

    const { english, hindi, use, next } = response;

    return (
        <div className="coach-card glass-card">
            <div className="coach-header">
                <span className="coach-icon">🎓</span>
                <span className="coach-title">Your English Coach</span>
            </div>

            <div className="coach-sections">
                {/* English Section */}
                {english && (
                    <div className="coach-section section-english">
                        <div className="section-label">
                            <span className="section-emoji">🗣</span>
                            Speak this in English
                        </div>
                        <p className="section-content english-text">
                            <TypedText text={english} speed={14} />
                        </p>
                    </div>
                )}

                {/* Hindi Section */}
                {hindi && (
                    <div className="coach-section section-hindi">
                        <div className="section-label">
                            <span className="section-emoji">🇮🇳</span>
                            Meaning in Hindi
                        </div>
                        <p className="section-content hindi-text">
                            <TypedText text={hindi} speed={14} />
                        </p>
                    </div>
                )}

                {/* When to Use */}
                {use && (
                    <div className="coach-section section-use">
                        <div className="section-label">
                            <span className="section-emoji">💡</span>
                            When to use
                        </div>
                        <p className="section-content use-text">
                            <TypedText text={use} speed={14} />
                        </p>
                    </div>
                )}

                {/* Your Turn */}
                {next && (
                    <div className="coach-section section-next">
                        <div className="section-label">
                            <span className="section-emoji">💬</span>
                            Your turn
                        </div>
                        <p className="section-content next-text">
                            <TypedText text={next} speed={14} />
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
