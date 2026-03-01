import { useEffect, useRef, useState } from 'react';
import MicButton from '../components/MicButton';
import ListeningAnimation from '../components/ListeningAnimation';
import ProcessingState from '../components/ProcessingState';
import { Send } from 'lucide-react';

const STATUS_LABELS = {
    idle: '✦ Tap the mic and speak in English',
    listening: '🎙 Listening…',
    thinking: 'Thinking...',
    speaking: '🔊 Speaking...',
    error: '⚠️ Something went wrong',
};

export default function ConversationView({
    status,
    coachResponse,
    error,
    history,
    isRecording,
    handleMicClick,
    handleSend,
    isDisabled,
}) {
    const bottomRef = useRef(null);
    const [input, setInput] = useState('');

    // Auto-scroll to bottom of conversation
    useEffect(() => {
        if (bottomRef.current) {
            setTimeout(() => {
                bottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [coachResponse, history, status]);

    const pastHistory = history.length > 1 ? history.slice(0, -1).slice(-5) : [];

    return (
        <div className="flex flex-col h-full m-0 p-0 relative">

            {/* Chat Area container with scrollablility */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-32 pt-4 px-2 sm:px-4 flex flex-col gap-6">

                {/* Welcome message if empty */}
                {pastHistory.length === 0 && !coachResponse && !isRecording && !['thinking', 'speaking'].includes(status) && (
                    <div className="flex flex-col items-center justify-center flex-1 text-center opacity-70 mt-12">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
                            <span className="text-3xl">🎓</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Ready to practice?</h3>
                        <p className="text-white/60 max-w-sm">Tap the microphone below and start speaking in English. Your AI tutor will help you improve.</p>
                    </div>
                )}

                {/* Existing History Bubbles */}
                {pastHistory.map((msg, idx) => (
                    <div key={`history-${idx}`} className={`flex flex-col gap-4 ${msg.isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-start gap-3 w-max max-w-[85%] ${msg.isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-sm ${msg.isUser ? 'bg-secondary/30 border-secondary/50' : 'bg-primary/30 border-primary/50'}`}>
                                {msg.isUser ? 'U' : 'V'}
                            </div>
                            <div className={`glass-card !p-4 !rounded-2xl bg-surface/80 ${msg.isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                <pre className="whitespace-pre-wrap font-sans text-sm text-white/90">{msg.text}</pre>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Current Coach Response */}
                {coachResponse && (
                    <div className="flex items-start gap-3 w-max max-w-[85%] self-start animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center shrink-0 border border-primary/50 text-sm">
                            V
                        </div>
                        <div className="glass-card !p-4 !rounded-2xl rounded-tl-sm bg-surface/80 border-primary/30 shadow-[0_4px_24px_rgba(124,92,252,0.1)]">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-white/90">{coachResponse.text || coachResponse.response || coachResponse}</pre>
                        </div>
                    </div>
                )}

                {/* Status Indicators (Listening / Processing in flow) */}
                {(status === 'listening' || status === 'thinking' || status === 'speaking' || error) && (
                    <div className="flex justify-center my-4 animate-fade-in">
                        {status === 'listening' && (
                            <div className="glass-card !py-2 !px-4 !rounded-full bg-listening-color/10 border-listening-color/30 flex items-center gap-3">
                                <ListeningAnimation /> <span className="text-sm font-medium text-listening-color">Listening...</span>
                            </div>
                        )}
                        {status === 'thinking' && (
                            <div className="glass-card !py-2 !px-4 !rounded-full flex items-center gap-3 bg-white/5">
                                <ProcessingState /> <span className="text-sm font-medium text-white/70">Tutor is thinking...</span>
                            </div>
                        )}
                        {status === 'speaking' && (
                            <div className="glass-card !py-2 !px-4 !rounded-full flex items-center gap-3 bg-primary/10 border-primary/30 border">
                                <span className="text-xl animate-pulse">🔊</span> <span className="text-sm font-medium text-primary">Tutor is speaking...</span>
                            </div>
                        )}
                        {error && (
                            <div className="glass-card !py-2 !px-4 !rounded-md bg-error/10 border-error/20 flex items-center gap-2 text-error text-sm">
                                ⚠️ {error}
                            </div>
                        )}
                    </div>
                )}

                <div ref={bottomRef} className="h-4 w-full" />
            </div>

            {/* Input Bottom Bar (Fixed to bottom of view) */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent pt-12">
                <div className="max-w-3xl mx-auto flex items-center gap-3 glass-card !p-1.5 !rounded-full border-[#2a2a35] shadow-lg bg-[#12121a]">

                    {/* Mic Toggle */}
                    <div className="shrink-0">
                        <MicButton
                            status={status}
                            onClick={handleMicClick}
                            disabled={isDisabled}
                        />
                    </div>

                    {/* Text Input (auto focus) */}
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (input.trim() && !isDisabled) {
                                    handleSend(input);
                                    setInput('');
                                }
                            }
                        }}
                        placeholder="Type a message or use the mic..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-[15px] px-3 h-12"
                        autoFocus
                    />

                    {/* Send Button */}
                    <button
                        onClick={() => {
                            if (input.trim() && !isDisabled) {
                                handleSend(input);
                                setInput('');
                            }
                        }}
                        disabled={isDisabled || !input.trim()}
                        className="w-12 h-12 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0 shadow-md shadow-primary/20"
                    >
                        <Send size={20} className="translate-x-[1px] translate-y-[-1px]" />
                    </button>

                </div>
                <div className="text-center mt-3">
                    <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">
                        {status === 'idle' ? 'Ready to listen' : (STATUS_LABELS[status] || '')}
                    </p>
                </div>
            </div>
        </div>
    );
}
