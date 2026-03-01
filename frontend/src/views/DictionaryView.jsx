import { useState, useMemo } from 'react';
import { Search, Volume2, Book, ChevronRight, Folder } from 'lucide-react';
import offlineDictionary from '../assets/dictionary.json';

export default function DictionaryView() {
    const [query, setQuery] = useState('');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Derive categories dynamically from the JSON
    const categoriesMap = useMemo(() => {
        const map = {};
        Object.values(offlineDictionary).forEach(entry => {
            const cat = entry.category || 'General Essential Vocabulary';
            if (!map[cat]) map[cat] = [];
            map[cat].push(entry);
        });
        // Sort words in each category alphabetically
        Object.keys(map).forEach(cat => {
            map[cat].sort((a, b) => a.word.localeCompare(b.word));
        });
        return map;
    }, []);

    const categories = Object.keys(categoriesMap).sort();

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        setSearch(val.toLowerCase().trim());
    };

    const handleSpeech = (word, e) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    const hasSearched = search.length > 0;

    // Quick direct search match
    const directMatch = hasSearched ? offlineDictionary[search] : null;

    // Render a Word Card
    const renderWordCard = (entry, key) => (
        <div key={key} className="bg-[#12121a] rounded-[24px] p-6 sm:p-7 border border-[#2a2a35] shadow-xl text-left relative group hover:border-[#3b82f6]/30 transition-colors">
            <div className="flex items-end gap-3 mb-5">
                <h3 className="text-[24px] font-bold text-white capitalize">{entry.word}</h3>
                <span className="text-[#3b82f6] font-medium text-[13px] mb-1">{entry.pos}</span>
            </div>

            <button
                onClick={(e) => handleSpeech(entry.word, e)}
                className="text-white/40 hover:text-white transition-colors mb-6 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase"
            >
                <Volume2 size={18} /> Listen
            </button>

            <div className="space-y-4">
                <div className="bg-[#1a1a24] rounded-xl p-[17px] border-l-[3px] border-[#eab308]">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[#eab308] font-bold mb-1.5 flex items-center gap-2">
                        <span>🇮🇳</span> HINDI
                    </p>
                    <p className="text-white/90 font-medium text-[17px]">{entry.hindi}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.08em] text-white/40 font-semibold mb-1 mt-4">Meaning</p>
                    <p className="text-white/70 text-[14px]">{entry.meaning}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pt-8 pb-20 px-4">

            {/* Search Header */}
            <div className="mb-10 text-center animate-fade-in relative z-10">
                <h2 className="text-3xl font-bold mb-2 text-white tracking-tight">Offline Dictionary</h2>
                <p className="text-white/50 text-[15px]">Browse categories or search the 2000+ word library</p>
            </div>

            <div className="relative mb-10 animate-slide-up max-w-[32rem] mx-auto z-10">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/50">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search a specific word..."
                    className="w-full bg-[#161622] rounded-[20px] py-[16px] pl-[3.25rem] pr-4 text-white text-[16px] placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all font-medium border border-[#2a2a35] shadow-lg"
                />
            </div>

            {hasSearched ? (
                // Search Results Mode
                <div className="animate-card-enter max-w-[32rem] mx-auto">
                    {directMatch ? (
                        renderWordCard(directMatch, 'direct')
                    ) : Object.keys(offlineDictionary).some(k => k.startsWith(search)) ? (
                        <div className="space-y-4">
                            <p className="text-white/50 text-sm mb-4">Matches for "{search}"</p>
                            {Object.values(offlineDictionary)
                                .filter(entry => entry.word.startsWith(search))
                                .slice(0, 10)
                                .map(entry => renderWordCard(entry, entry.word))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-70 mt-4">
                            <Book size={48} className="text-white/20 mb-4" />
                            <p className="text-white/50 text-center text-[15px]">
                                "{search}" was not found.<br />Try another word.
                            </p>
                        </div>
                    )}
                </div>
            ) : selectedCategory ? (
                // Browse Category Content Mode
                <div className="animate-fade-in">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-white/40 hover:text-white mb-8 text-[13px] font-medium transition-colors"
                    >
                        <ChevronRight size={16} className="rotate-180" /> Back to Categories
                    </button>

                    <h3 className="text-[22px] font-bold text-white mb-6 flex items-center gap-3">
                        <Folder size={24} className="text-primary" /> {selectedCategory}
                        <span className="text-white/30 text-[14px] font-medium ml-2">({categoriesMap[selectedCategory].length} words)</span>
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {categoriesMap[selectedCategory].map(entry => renderWordCard(entry, entry.word))}
                    </div>
                </div>
            ) : (
                // Categories Grid Mode
                <div className="grid sm:grid-cols-2 gap-4 animate-slide-up">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className="bg-[#12121a] hover:bg-[#1a1a24] p-6 border border-[#2a2a35] hover:border-primary/40 rounded-[20px] transition-all duration-300 shadow-xl group hover:-translate-y-1 text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    <Folder size={20} />
                                </div>
                                <div>
                                    <h4 className="text-[17px] font-semibold text-white/90 group-hover:text-white mb-1 transition-colors">{cat}</h4>
                                    <p className="text-[13px] text-white/40">{categoriesMap[cat].length} words</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>
            )}

        </div>
    );
}
