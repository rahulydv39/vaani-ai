import { useState } from 'react';
import { MessageSquare, BookOpen, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

import { grammarData } from '../data/grammarData';

// Generate a random pool of 5 questions from all grammar chapters
function getRandomQuestions(count = 5) {
    const allQs = [];
    grammarData.forEach(chap => {
        if (chap.quiz) allQs.push(...chap.quiz);
    });
    const shuffled = [...allQs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(q => ({
        q: q.q,
        options: q.opts,
        answer: q.ans
    }));
}

export default function QuizView() {
    const [mode, setMode] = useState(null); // 'conversation' | 'grammar' | null
    const [isStarted, setIsStarted] = useState(false);

    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // --- Handlers ---
    const handleSelectMode = (m) => {
        setMode(m);
    };

    const [activeQuestions, setActiveQuestions] = useState([]);

    const handleStartQuiz = () => {
        setIsStarted(true);
        setCurrentQIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedOption(null);
        setIsAnswered(false);
        setActiveQuestions(getRandomQuestions(5)); // Load 5 random questions
    };

    const handleOptionClick = (idx) => {
        if (isAnswered) return;
        setSelectedOption(idx);
        setIsAnswered(true);

        if (idx === activeQuestions[currentQIndex].answer) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentQIndex < activeQuestions.length - 1) {
            setCurrentQIndex(cur => cur + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const handleReset = () => {
        setMode(null);
        setIsStarted(false);
    };

    // --- Screens ---

    // 1. Selection Screen
    if (!mode) {
        return (
            <div className="max-w-3xl mx-auto pt-8 pb-20 animate-fade-in relative z-10">
                <h2 className="text-3xl font-bold mb-3 text-white">Practice Quiz</h2>
                <p className="text-white/60 mb-10 text-sm">Select how you want to test your English skills today.</p>

                <div className="space-y-4">
                    <button
                        onClick={() => handleSelectMode('conversation')}
                        className="w-full bg-[#12121a] border border-[#2a2a35] hover:border-[#3b82f6]/50 rounded-[24px] p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group"
                    >
                        <MessageSquare size={36} className="mx-auto mb-4 text-[#3b82f6]/70 group-hover:text-[#3b82f6] transition-colors" />
                        <h3 className="text-[19px] font-bold mb-2 text-white/90 group-hover:text-white">Conversation Based</h3>
                        <p className="text-[14.5px] text-white/50 mb-4 max-w-sm mx-auto">Test yourself on what you just talked about with the AI tutor. Focus on your recent mistakes.</p>
                        <div className="flex items-center justify-center gap-1.5 text-[#3b82f6] text-[13.5px] font-medium">
                            Start Quiz <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={() => handleSelectMode('grammar')}
                        className="w-full bg-[#12121a] border border-[#2a2a35] hover:border-[#06b6d4]/50 rounded-[24px] p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group"
                    >
                        <BookOpen size={36} className="mx-auto mb-4 text-[#06b6d4]/70 group-hover:text-[#06b6d4] transition-colors" />
                        <h3 className="text-[19px] font-bold mb-2 text-white/90 group-hover:text-white">Grammar Quiz</h3>
                        <p className="text-[14.5px] text-white/50 mb-4 max-w-lg mx-auto">Target specific grammar topics like tenses, prepositions, or articles with structured questions.</p>
                        <div className="flex items-center justify-center gap-1.5 text-[#06b6d4] text-[13.5px] font-medium">
                            Select Topic <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // 2. Start Screen
    if (!isStarted) {
        return (
            <div className="max-w-2xl mx-auto pt-6 pb-20 animate-fade-in relative z-10 text-center">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-white/40 hover:text-white mb-8 text-[13px] font-medium transition-colors mx-auto"
                >
                    <ChevronRight size={16} className="rotate-180" /> Back
                </button>

                <div className="bg-[#12121a] border border-[#2a2a35] rounded-[24px] p-10 shadow-xl">
                    <h3 className="text-[26px] font-bold mb-3 text-white">
                        {mode === 'conversation' ? 'Conversation Quiz' : 'Grammar Quiz'}
                    </h3>
                    <p className="text-white/60 mb-10 text-[15px] leading-relaxed max-w-md mx-auto">
                        {mode === 'conversation'
                            ? 'We have generated a personalized quiz based on your previous conversations. 5 questions remaining.'
                            : 'Test your understanding across all grammar topics randomly. 5 questions remaining.'}
                    </p>
                    <button
                        onClick={handleStartQuiz}
                        className="px-[32px] py-[14px] rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-[15px] transition-all shadow-[0_4px_20px_rgba(107,76,255,0.3)] hover:scale-105 active:scale-95"
                    >
                        Start Quiz Engine
                    </button>
                </div>
            </div>
        );
    }

    // 3. Result Screen
    if (showResult) {
        return (
            <div className="max-w-2xl mx-auto pt-10 pb-20 animate-slide-up relative z-10 text-center">
                <div className="bg-[#12121a] border border-[#2a2a35] rounded-[30px] p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div className="inline-flex w-24 h-24 rounded-full bg-success/20 items-center justify-center text-success mb-6 shadow-[0_0_40px_rgba(52,211,153,0.2)]">
                        <CheckCircle2 size={48} />
                    </div>

                    <h2 className="text-[32px] font-bold text-white mb-2">Quiz Completed!</h2>
                    <p className="text-white/60 text-[16px] mb-8">You scored {score} out of {activeQuestions.length}.</p>

                    <button
                        onClick={handleReset}
                        className="px-[28px] py-[14px] rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[15px] transition-all"
                    >
                        Return to Menu
                    </button>
                </div>
            </div>
        );
    }

    // 4. Active Quiz Screen
    const qData = activeQuestions[currentQIndex];

    return (
        <div className="max-w-2xl mx-auto pt-6 pb-20 animate-card-enter relative z-10">

            {/* Progress */}
            <div className="flex items-center justify-between mb-8">
                <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest">Question {currentQIndex + 1} of {activeQuestions.length}</span>
                <span className="text-primary text-[13px] font-bold">Score: {score}</span>
            </div>

            <div className="bg-[#12121a] border border-[#2a2a35] rounded-[24px] p-8 sm:p-10 shadow-2xl mb-6">
                <h3 className="text-white text-[22px] sm:text-[24px] leading-snug font-semibold mb-10 text-center">{qData.q}</h3>

                <div className="space-y-3">
                    {qData.options.map((opt, idx) => {
                        const isCorrect = idx === qData.answer;
                        const isSelected = selectedOption === idx;

                        let tileState = "bg-[#1a1a24] border border-[#2a2a35] text-white/80 hover:bg-[#20202d] hover:border-white/20";

                        if (isAnswered) {
                            if (isCorrect) {
                                tileState = "bg-success/10 border-success/40 text-success shadow-[0_0_15px_rgba(52,211,153,0.1)]";
                            } else if (isSelected) {
                                tileState = "bg-error/10 border-error/40 text-error";
                            } else {
                                tileState = "bg-[#1a1a24] border-[#2a2a35] text-white/30";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(idx)}
                                disabled={isAnswered}
                                className={clsx(
                                    "w-full p-4 rounded-xl text-left font-medium text-[15.5px] transition-all flex items-center justify-between",
                                    tileState
                                )}
                            >
                                <span>{opt}</span>
                                {isAnswered && isCorrect && <CheckCircle2 size={18} className="shrink-0" />}
                                {isAnswered && isSelected && !isCorrect && <XCircle size={18} className="shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Next Button Container */}
            {isAnswered && (
                <div className="flex justify-end animate-fade-in">
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold text-[14.5px] transition-all"
                    >
                        {currentQIndex < activeQuestions.length - 1 ? 'Next Question' : 'View Results'} <ChevronRight size={18} />
                    </button>
                </div>
            )}

        </div>
    );
}
