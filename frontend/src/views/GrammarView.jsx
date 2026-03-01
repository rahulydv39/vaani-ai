import { useState } from 'react';
import { BookOpen, ChevronRight, Play, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

import { grammarData } from '../data/grammarData';

export default function GrammarView() {
    const [activeChapter, setActiveChapter] = useState(null);
    const [quizActive, setQuizActive] = useState(false);

    // Quiz State
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    const startQuiz = () => {
        setQuizActive(true);
        setCurrentQ(0);
        setSelectedOpt(null);
        setIsAnswered(false);
        setScore(0);
        setQuizDone(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOptClick = (idx) => {
        if (isAnswered) return;
        setSelectedOpt(idx);
        setIsAnswered(true);
        if (idx === activeChapter.quiz[currentQ].ans) {
            setScore(s => s + 1);
        }
    };

    const nextQ = () => {
        if (currentQ < activeChapter.quiz.length - 1) {
            setCurrentQ(c => c + 1);
            setSelectedOpt(null);
            setIsAnswered(false);
        } else {
            setQuizDone(true);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pt-6 pb-20 px-2 sm:px-4 relative z-10 w-full full-width-mobile animate-fade-in">

            {!activeChapter ? (
                // Chapters Menu
                <>
                    <div className="mb-10 text-center sm:text-left">
                        <h2 className="text-3xl font-bold mb-3 text-white tracking-tight">Grammar Chapters</h2>
                        <p className="text-white/60">Learn foundational grammar rules before you practice.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {grammarData.map((chap) => (
                            <button
                                key={chap.id}
                                onClick={() => setActiveChapter(chap)}
                                className="bg-[#12121a] hover:bg-[#1a1a24] !p-6 flex flex-col items-start border border-[#2a2a35] hover:border-[#3b82f6]/50 rounded-[20px] transition-all duration-300 shadow-xl group hover:-translate-y-1 text-left"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen size={24} />
                                </div>
                                <h4 className="text-xl font-semibold mb-2 text-white group-hover:text-primary-light transition-colors">{chap.title}</h4>
                                <p className="text-[14.5px] text-white/50 mb-5">{chap.desc}</p>
                                <div className="mt-auto w-full pt-4 border-t border-white/5 flex items-center justify-between text-[#3b82f6] text-sm font-medium">
                                    <span>Start Learning</span>
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            ) : quizActive ? (
                // Quiz View
                <div className="max-w-2xl mx-auto mt-6">
                    <button
                        onClick={() => setQuizActive(false)}
                        className="flex items-center gap-2 text-white/40 hover:text-white mb-8 text-[13px] font-medium transition-colors"
                    >
                        <ChevronRight size={16} className="rotate-180" /> Back to Chapter
                    </button>

                    {!quizDone ? (
                        <div className="bg-[#12121a] border border-[#2a2a35] rounded-[24px] p-8 sm:p-10 shadow-2xl animate-card-enter">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-[#3b82f6] font-semibold text-[13px] uppercase tracking-widest">{activeChapter.title} Quiz</span>
                                <span className="text-white/40 text-[13px] font-medium">{currentQ + 1} / {activeChapter.quiz.length}</span>
                            </div>
                            <h3 className="text-white text-[22px] font-semibold mb-8">{activeChapter.quiz[currentQ].q}</h3>

                            <div className="space-y-3">
                                {activeChapter.quiz[currentQ].opts.map((opt, idx) => {
                                    const isCorrect = idx === activeChapter.quiz[currentQ].ans;
                                    const isSelected = selectedOpt === idx;
                                    let tileState = "bg-[#1a1a24] border border-[#2a2a35] text-white/80 hover:bg-[#20202d] hover:border-white/20";

                                    if (isAnswered) {
                                        if (isCorrect) tileState = "bg-success/10 border-success/40 text-success shadow-[0_0_15px_rgba(52,211,153,0.1)]";
                                        else if (isSelected) tileState = "bg-error/10 border-error/40 text-error";
                                        else tileState = "bg-[#1a1a24] border-[#2a2a35] text-white/30";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptClick(idx)}
                                            disabled={isAnswered}
                                            className={clsx("w-full p-4 rounded-xl text-left font-medium text-[15.5px] transition-all flex items-center justify-between", tileState)}
                                        >
                                            <span>{opt}</span>
                                            {isAnswered && isCorrect && <CheckCircle2 size={18} />}
                                            {isAnswered && isSelected && !isCorrect && <XCircle size={18} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {isAnswered && (
                                <div className="mt-8 flex justify-end animate-fade-in">
                                    <button onClick={nextQ} className="px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-[14.5px] transition-all flex items-center gap-2">
                                        {currentQ < activeChapter.quiz.length - 1 ? 'Next' : 'Finish'} <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#12121a] border border-[#2a2a35] rounded-[30px] p-12 shadow-2xl text-center animate-slide-up relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                            <div className="inline-flex w-24 h-24 rounded-full bg-success/20 items-center justify-center text-success mb-6 shadow-[0_0_40px_rgba(52,211,153,0.2)] relative z-10">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-[32px] font-bold text-white mb-2 relative z-10">Chapter Completed!</h2>
                            <p className="text-white/60 text-[16px] mb-8 relative z-10">You scored {score} out of {activeChapter.quiz.length} on {activeChapter.title}.</p>
                            <button onClick={() => { setQuizActive(false); setActiveChapter(null); }} className="px-[28px] py-[14px] rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[15px] transition-all relative z-10">
                                Back to Chapters
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Chapter details
                <div className="mb-10">
                    <button
                        onClick={() => setActiveChapter(null)}
                        className="flex items-center gap-2 text-white/40 hover:text-white mb-8 text-[13px] font-medium transition-colors"
                    >
                        <ChevronRight size={16} className="rotate-180" /> Back to Chapters
                    </button>

                    <div className="bg-[#12121a] border border-[#2a2a35] rounded-[24px] overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="bg-[#161622]/80 px-8 py-6 border-b border-[#2a2a35]">
                            <div className="inline-flex items-center gap-2 text-[#3b82f6] text-[12px] font-bold uppercase tracking-widest mb-3 bg-[#3b82f6]/10 px-3 py-1 rounded-full border border-[#3b82f6]/20">
                                <BookOpen size={14} /> English Lessons
                            </div>
                            <h3 className="text-white font-bold text-3xl tracking-tight">{activeChapter.title}</h3>
                        </div>

                        <div className="p-8 sm:p-10 relative z-10">
                            {activeChapter.sections.map((sec, idx) => (
                                <div key={idx} className={clsx("mb-12", idx === activeChapter.sections.length - 1 && "mb-4")}>
                                    <h4 className="text-[20px] font-bold text-white mb-3 tracking-tight">{sec.sub}</h4>
                                    <p className="text-white/80 text-[15.5px] mb-6 tracking-wide leading-relaxed italic border-l-2 border-[#eab308]/50 pl-4 py-1">
                                        Use: {sec.use}
                                    </p>

                                    <div className="bg-[#1a1a2e] rounded-xl px-5 py-4 mb-7 shadow-inner font-medium text-white/90 text-[15px] flex items-center border border-[#2a2a35]">
                                        <span className="text-white/60 mr-3 font-semibold tracking-wide uppercase text-xs">Structure</span>
                                        <span className="text-[#3b82f6] font-mono">{sec.structure}</span>
                                    </div>

                                    <div className="space-y-4">
                                        {sec.examples.map((ex, e_idx) => (
                                            <div key={e_idx} className="bg-[#161622] rounded-xl p-4 border border-[#2a2a35] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-colors">
                                                <div className="flex-1">
                                                    <p className="text-white font-medium text-[16px] mb-1">{ex.eng}</p>
                                                    <p className="text-white/50 text-[14px]">{ex.hin}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-12 pt-8 border-t border-[#2a2a35] flex items-center justify-between flex-wrap gap-4 bg-[#1a1a24] -mx-8 -mb-8 px-8 py-6 rounded-b-[24px]">
                                <p className="text-[15px] font-medium text-white/70">Ready to test your knowledge?</p>
                                <button
                                    onClick={startQuiz}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-[14px] transition-all shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
                                >
                                    <Play size={18} /> Test Your Knowledge
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
