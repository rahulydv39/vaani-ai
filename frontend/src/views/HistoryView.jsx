import { Clock, MessageSquare, ChevronRight } from 'lucide-react';

export default function HistoryView({ setActiveView, sessions = [] }) {

    // Format dates elegantly
    const formatTime = (isoString) => {
        const d = new Date(isoString);
        return d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto pt-6 pb-20 px-2 sm:px-4 relative z-10 w-full full-width-mobile">
            <div className="mb-10 animate-fade-in text-center sm:text-left">
                <h2 className="text-3xl font-bold mb-3 flex items-center justify-center sm:justify-start gap-3 text-white tracking-tight">
                    <Clock className="text-white/50" size={28} /> Chat History
                </h2>
                <p className="text-white/50 text-[15px]">Review your past conversations to see your progress.</p>
            </div>

            <div className="space-y-4">
                {sessions.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView('conversation')}
                        className="w-full bg-[#12121a] border border-[#2a2a35] hover:border-primary/40 rounded-[20px] p-[20px] flex items-center justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-slide-up text-left"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 shrink-0 rounded-full bg-[#161622] flex items-center justify-center text-primary border border-white/5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <MessageSquare size={18} />
                            </div>
                            <div>
                                <h4 className="text-[17px] font-semibold text-white/90 group-hover:text-white transition-colors mb-1 truncate max-w-[200px] sm:max-w-md">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[13px] text-white/40 font-medium">
                                    <span>{formatTime(item.lastUpdated)}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                    <span className="text-primary/70">{item.messages?.length || 0} snippets</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-10 h-10 shrink-0 rounded-full bg-white/[0.03] flex items-center justify-center text-white/30 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                            <ChevronRight size={18} className="translate-x-[1px]" />
                        </div>
                    </button>
                ))}
            </div>

            {sessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-70 animate-fade-in">
                    <Clock size={48} className="mb-5 text-white/20" />
                    <p className="text-white/50 text-[15px]">No conversation history found.<br />Start speaking in the Conversation tab!</p>
                </div>
            )}
        </div>
    );
}
