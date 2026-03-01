import { Menu, Zap } from 'lucide-react';
import { clsx } from 'clsx';

export default function Header({ toggleSidebar, activeViewLabel, isMobile }) {
    return (
        <header className="h-16 border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Toggle Menu"
                >
                    <Menu size={24} />
                </button>

                <h1 className="text-lg font-semibold text-white/90 capitalize flex items-center gap-2">
                    {activeViewLabel}
                    {isMobile && <span className="text-sm font-normal text-white/40 ml-2 hidden sm:inline">| Vaani AI</span>}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Status Pills */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
                    On-device
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="hidden sm:inline">WebGPU</span>
                </div>
            </div>
        </header>
    );
}
