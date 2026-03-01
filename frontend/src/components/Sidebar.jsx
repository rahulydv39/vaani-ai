import { MessageSquare, FileQuestion, BookOpen, Book, Clock, Info, Phone, Shield, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
    { id: 'conversation', label: 'Conversation', icon: MessageSquare, group: 'LEARN' },
    { id: 'quiz', label: 'Quiz', icon: FileQuestion, group: 'LEARN' },
    { id: 'grammar', label: 'Grammar', icon: BookOpen, group: 'LEARN' },
    { id: 'dictionary', label: 'Dictionary', icon: Book, group: 'LEARN' },
    { id: 'history', label: 'History', icon: Clock, group: 'LEARN' },
    { id: 'about', label: 'About', icon: Info, group: 'MORE' },
    { id: 'contact', label: 'Contact', icon: Phone, group: 'MORE' },
    { id: 'privacy', label: 'Privacy', icon: Shield, group: 'MORE' },
];

export default function Sidebar({ isOpen, isMobile, toggleSidebar, activeView, setActiveView }) {
    const sidebarClasses = twMerge(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-white/10 transition-all duration-300 ease-in-out',
        isOpen ? 'w-64 translate-x-0' : (isMobile ? '-translate-x-full w-64' : 'w-20 translate-x-0')
    );

    const handleNavClick = (id) => {
        setActiveView(id);
        if (isMobile) {
            toggleSidebar();
        }
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Panel */}
            <aside className={sidebarClasses}>
                {/* Header / Logo Area */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
                    <div className={clsx('flex items-center gap-3 overflow-hidden transition-opacity duration-300', !isOpen && !isMobile ? 'opacity-0 w-0' : 'opacity-100')}>
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shrink-0">
                            V
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-white whitespace-nowrap">Vaani AI</span>
                            <span className="text-xs text-white/50 whitespace-nowrap">English Tutor</span>
                        </div>
                    </div>

                    {/* Close button on mobile, Collapse button on desktop */}
                    {isMobile ? (
                        <button onClick={toggleSidebar} className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10">
                            <X size={20} />
                        </button>
                    ) : (
                        <button onClick={toggleSidebar} className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 absolute -right-3 top-5 bg-surface border border-white/10">
                            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6 custom-scrollbar">
                    {['LEARN', 'MORE'].map((group) => {
                        const items = navItems.filter((item) => item.group === group);
                        return (
                            <div key={group} className="flex flex-col gap-1">
                                <div className={clsx(
                                    'px-3 mb-2 text-xs font-semibold tracking-wider text-white/40 transition-opacity duration-200',
                                    !isOpen && !isMobile ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'
                                )}>
                                    {group}
                                </div>
                                {items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeView === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleNavClick(item.id)}
                                            className={clsx(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                                                isActive
                                                    ? 'bg-primary/20 text-primary-light border border-primary/30'
                                                    : 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                                            )}
                                            title={!isOpen && !isMobile ? item.label : undefined}
                                        >
                                            <Icon size={20} className={clsx('shrink-0', isActive ? 'text-primary-light' : 'text-white/50 group-hover:text-white/80')} />
                                            <span className={clsx(
                                                'font-medium whitespace-nowrap transition-opacity duration-200',
                                                !isOpen && !isMobile ? 'opacity-0 w-0 hidden' : 'opacity-100 block'
                                            )}>
                                                {item.label}
                                            </span>

                                            {/* Active indicator dot for collapsed state */}
                                            {isActive && !isOpen && !isMobile && (
                                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}
