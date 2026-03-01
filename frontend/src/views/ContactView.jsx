import { Phone, Mail, MessageSquare } from 'lucide-react';

export default function ContactView() {
    return (
        <div className="max-w-2xl mx-auto pt-6 pb-20 animate-fade-in relative z-10">

            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-6 border border-primary/30 shadow-[0_0_30px_rgba(124,92,252,0.2)]">
                    <Phone size={28} />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-white">Contact Us</h2>
                <p className="text-white/60">We would love to hear your feedback.</p>
            </div>

            <div className="glass-card !p-8 md:!p-10 border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#22d3ee]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70">Name</label>
                            <input type="text" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70">Email</label>
                            <input type="email" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm" placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Message</label>
                        <textarea rows={5} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm custom-scrollbar resize-none" placeholder="Share your thoughts or report an issue..."></textarea>
                    </div>

                    <button className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                        <MessageSquare size={18} /> Send Message
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60">
                    <div className="flex items-center gap-2">
                        <Mail size={16} className="text-primary" />
                        <a href="mailto:hello@vaani.ai" className="hover:text-white transition-colors">hello@vaani.ai</a>
                    </div>
                </div>

            </div>

        </div>
    );
}
