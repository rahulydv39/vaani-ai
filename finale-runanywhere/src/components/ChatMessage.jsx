import { parseTeachingResponse, cleanLLMOutput } from '../ai/llm'

const LANG_LABELS = { english: '🇬🇧 EN', hindi: '🇮🇳 हिं', hinglish: '🇮🇳🇬🇧 Mix' }

export function ChatMessage({ message, isStreaming }) {
    const isUser = message.role === 'user'
    const time = message.timestamp
        ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : ''

    // Parse structured AI responses
    const parsed = !isUser && message.content ? parseTeachingResponse(message.content) : null

    return (
        <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'}`}>
            {!isUser && (
                <div className="chat-avatar">
                    <span className="chat-avatar-icon">🎓</span>
                </div>
            )}
            <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                {isUser ? (
                    /* ─── User message ─── */
                    <div className="chat-text">
                        {message.detectedLang && (
                            <span className="lang-badge">{LANG_LABELS[message.detectedLang] || '🌐'}</span>
                        )}
                        {message.content}
                    </div>
                ) : parsed ? (
                    /* ─── Structured Teaching Card ─── */
                    <div className="teaching-card">
                        {parsed.mode === 'translate' ? (
                            <>
                                <div className="teaching-english">
                                    {parsed.english}
                                    {isStreaming && <span className="typing-cursor">▊</span>}
                                </div>

                                {parsed.hindi_explanation && (
                                    <div className="teaching-hindi">
                                        <span className="teaching-label">🇮🇳 Hindi</span>
                                        <span className="teaching-hindi-text">{parsed.hindi_explanation}</span>
                                    </div>
                                )}

                                {parsed.tips && (
                                    <div className="teaching-tip">
                                        <span className="teaching-label">💡 Tip</span>
                                        <span>{parsed.tips}</span>
                                    </div>
                                )}
                            </>
                        ) : parsed.mode === 'correction' ? (
                            <>
                                <div className="teaching-english">
                                    {parsed.is_correct
                                        ? '✅ Great job! Your sentence is correct.'
                                        : '❌ Let\'s improve this.'}
                                    {isStreaming && <span className="typing-cursor">▊</span>}
                                </div>

                                {parsed.better_sentence && (
                                    <div className="teaching-hindi">
                                        <span className="teaching-label">📝 Say it like this</span>
                                        <span className="teaching-hindi-text" style={{ fontWeight: 'bold' }}>
                                            {parsed.better_sentence}
                                        </span>
                                    </div>
                                )}

                                {parsed.hindi_explanation && (
                                    <div className="teaching-hindi">
                                        <span className="teaching-label">🇮🇳 Feedback</span>
                                        <span className="teaching-hindi-text">{parsed.hindi_explanation}</span>
                                    </div>
                                )}

                                {parsed.pronunciation_tip && (
                                    <div className="teaching-tip">
                                        <span className="teaching-label">🗣️ Pronunciation</span>
                                        <span>{parsed.pronunciation_tip}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Unknown mode — show best available field, never JSON.stringify */
                            <div className="teaching-english">
                                {parsed.english || parsed.better_sentence || parsed.response
                                    || Object.values(parsed).find(v => typeof v === 'string' && v.length > 2)
                                    || ''}
                                {isStreaming && <span className="typing-cursor">▊</span>}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ─── Fallback: clean raw text (preserves Hindi/Devanagari) ─── */
                    <div className="chat-text">
                        {cleanLLMOutput(message.content)}
                        {isStreaming && <span className="typing-cursor">▊</span>}
                    </div>
                )}
                {time && <div className="chat-time">{time}</div>}
            </div>
            {isUser && (
                <div className="chat-avatar chat-avatar-user">
                    <span className="chat-avatar-icon">👤</span>
                </div>
            )}
        </div>
    )
}
