import { Shield, Lock, EyeOff, ServerOff } from 'lucide-react';

export default function PrivacyView() {
    return (
        <div className="max-w-3xl mx-auto pt-6 pb-20 animate-fade-in relative z-10">

            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 text-success mb-6 border border-success/30 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                    <Shield size={32} />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-white">Privacy Policy</h2>
                <p className="text-white/60">Strictly on-device. Strictly private.</p>
            </div>

            <div className="glass-card !p-8 md:!p-10 border-white/10 space-y-8 relative overflow-hidden">

                <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex items-start gap-5 relative z-10">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white/80 border border-white/10 mt-1">
                        <ServerOff size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-white">No Cloud Processing</h3>
                        <p className="text-white/60 leading-relaxed text-sm">
                            Unlike traditional AI applications that send your voice to cloud servers for processing, Vaani AI runs the entire Large Language Model (LLM) locally on your device hardware.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-5 relative z-10">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white/80 border border-white/10 mt-1">
                        <EyeOff size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-white">No Data Collection</h3>
                        <p className="text-white/60 leading-relaxed text-sm">
                            We do not collect, store, or transmit any analytics, voice snippets, or chat history. Your learning journey is 100% your own. Whatever you say to the tutor stays on the tutor.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-5 relative z-10">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-white/80 border border-white/10 mt-1">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-white">Local Storage</h3>
                        <p className="text-white/60 leading-relaxed text-sm">
                            Your chat history is saved securely using your browser's local storage. This allows the app to remember past context without needing a database. You can clear this storage at any time from your browser settings.
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
}
