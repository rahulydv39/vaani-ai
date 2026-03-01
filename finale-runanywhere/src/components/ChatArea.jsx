import { useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { useAppState, AppStatus } from '../store/appStore'

const MODE_WELCOME = {
    casual: {
        icon: '\u{1F4AC}',
        title: 'Casual Conversation',
        desc: 'Practice everyday English. Talk about life, hobbies, food, movies \u2014 anything!',
        hint: 'Speak in Hindi, English, or Hinglish \u2014 I will understand!',
    },
    interview: {
        icon: '\u{1F4BC}',
        title: 'Interview Practice',
        desc: 'Prepare for job interviews. Practice HR questions, professional phrases, and confidence building.',
        hint: 'Let us start a mock interview. Ready?',
    },
    speaking: {
        icon: '\u{1F3A4}',
        title: 'Speaking Practice',
        desc: 'Improve your fluency with guided speaking exercises and detailed feedback.',
        hint: 'I will give you a topic to speak about. Start anytime!',
    },
}

export function ChatArea({ messages, streamingText }) {
    const bottomRef = useRef(null)
    const { status, mode } = useAppState()

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, streamingText])

    if (status === AppStatus.IDLE || status === AppStatus.INITIALIZING || status === AppStatus.DOWNLOADING) {
        return (
            <div className="chat-area">
                <div className="chat-welcome">
                    <div className="welcome-icon">{'\u{1F393}'}</div>
                    <h2>Welcome to Vaani AI</h2>
                    <p>Your bilingual on-device English speaking tutor</p>
                    <div className="welcome-features">
                        <div className="feature-card">
                            <span className="feature-icon">{'\u{1F1EE}\u{1F1F3}'}</span>
                            <span>Hindi + English</span>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">{'\u{1F512}'}</span>
                            <span>100% Private</span>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">{'\u{1F4F6}'}</span>
                            <span>Works Offline</span>
                        </div>
                        <div className="feature-card">
                            <span className="feature-icon">{'\u26A1'}</span>
                            <span>On-Device AI</span>
                        </div>
                    </div>
                    <p className="welcome-hint">
                        {status === AppStatus.DOWNLOADING ? '📥 Downloading AI models…' :
                            status === AppStatus.INITIALIZING ? '⚡ Initializing runtime…' :
                                '🔵 Getting ready…'}
                    </p>
                </div>
            </div>
        )
    }

    const welcome = MODE_WELCOME[mode] || MODE_WELCOME.casual

    if (messages.length === 0 && !streamingText) {
        return (
            <div className="chat-area">
                <div className="chat-empty">
                    <div className="mode-welcome-card">
                        <div className="mode-welcome-icon">{welcome.icon}</div>
                        <h3>{welcome.title}</h3>
                        <p>{welcome.desc}</p>
                        <p className="mode-welcome-hint">{welcome.hint}</p>
                    </div>
                    <div className="empty-hint-below">
                        <p>{'\u{1F3A4}'} Tap the mic and speak in Hindi, English, or Hinglish</p>
                        <p className="empty-hint">Or type your message below</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="chat-area">
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <ChatMessage
                        key={msg.id || idx}
                        message={msg}
                        isStreaming={false}
                    />
                ))}
                {streamingText && (
                    <ChatMessage
                        message={{ role: 'assistant', content: streamingText }}
                        isStreaming={true}
                    />
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}
