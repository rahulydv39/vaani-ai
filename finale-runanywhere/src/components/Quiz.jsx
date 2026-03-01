import { useState } from 'react'
import { useAppState } from '../store/appStore'

const QUIZ_TOPICS = [
    { id: 'random', icon: '🎲', label: 'Random' },
    { id: 'daily conversation', icon: '💬', label: 'Casual' },
    { id: 'grammar', icon: '📘', label: 'Grammar' },
    { id: 'interview english', icon: '💼', label: 'Interview' },
    { id: 'vocabulary', icon: '📚', label: 'Vocabulary' },
]

export function Quiz({ quiz, isLoading, isFallback, topic, onAnswer, onNext }) {
    const [selected, setSelected] = useState(null)
    const [revealed, setRevealed] = useState(false)
    const [currentTopic, setCurrentTopic] = useState('random')
    const { quizScore } = useAppState()

    const letters = ['A', 'B', 'C', 'D']

    const checkIsCorrectOption = (idx) => {
        if (!quiz) return false;
        const letter = letters[idx];
        const optionText = quiz.options[idx];
        const cleanOpt = optionText.replace(/^[A-D]\)\s*/, '').trim();
        const ans = String(quiz.answer).trim();

        if (letter === ans) return true;
        if (optionText === ans) return true;
        if (cleanOpt.toLowerCase() === ans.toLowerCase()) return true;
        if (ans.toLowerCase() === cleanOpt.toLowerCase().replace(/[.!?]$/, '')) return true;
        if (optionText.startsWith(ans + ')') || optionText.startsWith(ans + '.')) return true;
        if (ans.startsWith(letter + ')') || ans.startsWith(letter + '.')) return true;

        return false;
    }

    const isCorrect = selected !== null && checkIsCorrectOption(selected);

    const handleSelect = (idx) => {
        if (revealed) return
        setSelected(idx)
    }

    const handleSubmit = () => {
        if (selected === null || revealed) return
        setRevealed(true)
        onAnswer?.(isCorrect)
    }

    const handleNext = () => {
        setSelected(null)
        setRevealed(false)
        onNext?.(currentTopic)
    }

    const handleTopicChange = (newTopic) => {
        setCurrentTopic(newTopic)
        if (!isLoading) {
            setSelected(null)
            setRevealed(false)
            onNext?.(newTopic)
        }
    }

    return (
        <div className="quiz-fullpage">
            <div className="quiz-type-selector">
                {QUIZ_TOPICS.map(t => (
                    <button
                        key={t.id}
                        className={`quiz-type-btn ${currentTopic === t.id ? 'quiz-type-btn-active' : ''}`}
                        onClick={() => handleTopicChange(t.id)}
                        disabled={isLoading}
                    >
                        <span className="quiz-type-icon">{t.icon}</span>
                        <span className="quiz-type-label">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="quiz-score-bar">
                <div className="quiz-score-stats">
                    <span className="quiz-stat">✅ {quizScore.correct} correct</span>
                    <span className="quiz-stat">📊 {quizScore.total} total</span>
                    {quizScore.streak > 1 && <span className="quiz-stat quiz-streak">🔥 {quizScore.streak} streak!</span>}
                </div>
            </div>

            {isLoading ? (
                <div className="quiz-loading">
                    <div className="quiz-loading-icon">⏳</div>
                    <p>Generating quiz for: <strong style={{ color: 'var(--color-accent)' }}>{topic}</strong>…</p>
                    <div className="quiz-skeleton">
                        <div className="skeleton-line skeleton-title"></div>
                        <div className="skeleton-line skeleton-option"></div>
                        <div className="skeleton-line skeleton-option"></div>
                        <div className="skeleton-line skeleton-option"></div>
                        <div className="skeleton-line skeleton-option"></div>
                    </div>
                </div>
            ) : quiz ? (
                <div className="quiz-card">
                    <div className="quiz-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="quiz-type-badge">{quiz.topic || topic || 'Quiz'}</div>
                        {isFallback && <div className="quiz-fallback-badge" style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-amber)', borderRadius: '4px', fontWeight: '600' }}>Loaded instantly (offline mode)</div>}
                    </div>

                    <div className="quiz-question">{quiz.question}</div>

                    <div className="quiz-options">
                        {quiz.options.map((opt, idx) => {
                            let cls = 'quiz-option'
                            if (revealed) {
                                if (checkIsCorrectOption(idx)) cls += ' quiz-option-correct'
                                else if (idx === selected) cls += ' quiz-option-wrong'
                                else cls += ' quiz-option-dimmed'
                            } else if (idx === selected) {
                                cls += ' quiz-option-selected'
                            }

                            // Clean option text if it starts with A) B) C) D)
                            const cleanOpt = opt.replace(/^[A-D]\)\s*/, '')

                            return (
                                <button
                                    key={idx}
                                    className={cls}
                                    onClick={() => handleSelect(idx)}
                                    disabled={revealed}
                                >
                                    <span className="quiz-option-letter">{letters[idx]}</span>
                                    <span className="quiz-option-text">{cleanOpt}</span>
                                </button>
                            )
                        })}
                    </div>

                    {!revealed && (
                        <button
                            className="btn btn-primary quiz-submit-btn"
                            onClick={handleSubmit}
                            disabled={selected === null}
                        >
                            Submit Answer
                        </button>
                    )}

                    {revealed && (
                        <div className={`quiz-result ${isCorrect ? 'quiz-result-correct' : 'quiz-result-wrong'}`}>
                            <div className="quiz-result-icon">{isCorrect ? '✅' : '❌'}</div>
                            <div className="quiz-result-text">
                                {isCorrect ? 'Correct!' : `Wrong! The answer is ${quiz.answer}`}
                            </div>
                            {quiz.explanation && (
                                <div className="quiz-explanation">{quiz.explanation}</div>
                            )}
                            {quiz.hindiHint && (
                                <div className="quiz-hindi-hint">
                                    <span>🇮🇳</span> {quiz.hindiHint}
                                </div>
                            )}
                            <button className="btn btn-primary quiz-next-btn" onClick={handleNext}>
                                Next Question →
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="quiz-empty">
                    <div className="quiz-empty-icon">📝</div>
                    <h3>English Quiz</h3>
                    <p>Test your English skills instantly without internet.</p>
                    <button className="btn btn-primary btn-lg" onClick={handleNext}>
                        🎯 Start Quiz
                    </button>
                </div>
            )}
        </div>
    )
}
