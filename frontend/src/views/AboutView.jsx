import { Info, Cpu, WifiOff, Lock } from 'lucide-react';

export default function AboutView() {
    return (
        <div className="max-w-3xl mx-auto pt-6 pb-20 animate-fade-in">

            <div className="mb-12 text-center">
                <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-glow border border-primary-light/30">
                    <span className="text-4xl font-bold text-white tracking-widest leading-none">V</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Vaani AI</h2>
                <p className="text-lg text-white/60">Your bilingual on-device English speaking tutor.</p>
            </div>

            <div className="glass-card !p-8 md:!p-10 mb-8 border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                    <Info className="text-primary" /> About the App
                </h3>

                <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-p:leading-relaxed prose-strong:text-white/90">
                    <p>
                        <strong>Vaani AI</strong> is built specifically for English learners who speak Hindi. It provides an immersive, conversational environment where you can practice speaking without the fear of judgment.
                    </p>
                    <p>
                        The app listens to your Hindi or English input, translates or understands the context, and responds in clear English. This creates a natural translation and learning loop designed to improve your fluency rapidly.
                    </p>
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
                <div className="glass-card !p-6 text-center hover:-translate-y-1 transition-transform border-white/5 hover:border-success/30">
                    <div className="w-12 h-12 mx-auto rounded-full bg-success/10 flex items-center justify-center text-success mb-4">
                        <Cpu size={24} />
                    </div>
                    <h4 className="font-semibold text-white mb-2">On-Device AI</h4>
                    <p className="text-sm text-white/50">Powered by the latest LLMs running completely on your hardware.</p>
                </div>

                <div className="glass-card !p-6 text-center hover:-translate-y-1 transition-transform border-white/5 hover:border-[#22d3ee]/30">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#22d3ee]/10 flex items-center justify-center text-[#22d3ee] mb-4">
                        <Lock size={24} />
                    </div>
                    <h4 className="font-semibold text-white mb-2">100% Private</h4>
                    <p className="text-sm text-white/50">Your voice and conversations never leave your device.</p>
                </div>

                <div className="glass-card !p-6 text-center hover:-translate-y-1 transition-transform border-white/5 hover:border-[#a78bfa]/30">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#a78bfa]/10 flex items-center justify-center text-[#a78bfa] mb-4">
                        <WifiOff size={24} />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Works Offline</h4>
                    <p className="text-sm text-white/50">Practice anywhere, anytime, without needing an internet connection.</p>
                </div>
            </div>

        </div>
    );
}
