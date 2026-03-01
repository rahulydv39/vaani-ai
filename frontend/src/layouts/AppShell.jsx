import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { clsx } from 'clsx';

export default function AppShell({ children, activeView, setActiveView }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Handle window resize for responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            if (mobile) {
                setIsOpen(false);
            } else {
                setIsOpen(true); // Open by default on desktop
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsOpen(prev => !prev);

    // Derive the active view label for the header
    const viewLabels = {
        conversation: 'Conversation',
        quiz: 'Practice Quiz',
        grammar: 'Grammar Lessons',
        dictionary: 'Dictionary',
        history: 'History',
        about: 'About Vaani AI',
        contact: 'Contact Us',
        privacy: 'Privacy Policy',
    };

    return (
        <div className="min-h-screen bg-background text-white flex overflow-hidden">
            <Sidebar
                isOpen={isOpen}
                isMobile={isMobile}
                toggleSidebar={toggleSidebar}
                activeView={activeView}
                setActiveView={setActiveView}
            />

            <div className={clsx(
                "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out bg-background relative",
                !isMobile && isOpen ? "ml-64" : (!isMobile && !isOpen ? "ml-20" : "")
            )}>
                <Header
                    toggleSidebar={toggleSidebar}
                    activeViewLabel={viewLabels[activeView] || 'Vaani AI'}
                    isMobile={isMobile}
                />

                <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="absolute inset-0 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
