import { useState, useCallback, useMemo } from 'react'
import { speakEnglish } from '../ai/aiEngine'
import WORD_DATABASE from '../data/dictionary.json'

export function DictionaryView() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState(null)
    const [notFound, setNotFound] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)

    const wordsByCategory = useMemo(() => {
        const groups = {};
        Object.values(WORD_DATABASE).forEach(w => {
            const cat = w.pos ? (w.pos.charAt(0).toUpperCase() + w.pos.slice(1) + 's') : 'Others';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(w);
        });
        return groups;
    }, []);

    const handleSearch = useCallback((q) => {
        setQuery(q)
        setNotFound(false)
        setResult(null)

        if (!q.trim()) return

        const key = q.trim().toLowerCase()
        const found = WORD_DATABASE[key]
        if (found) {
            setResult(found)
        } else {
            // Try partial match
            const partial = Object.entries(WORD_DATABASE).find(([k]) => k.startsWith(key))
            if (partial) {
                setResult(partial[1])
            } else {
                setNotFound(true)
            }
        }
    }, [])

    const handlePronounce = async () => {
        if (!result || isPlaying) return
        setIsPlaying(true)
        try {
            await speakEnglish(result.word)
        } finally {
            setIsPlaying(false)
        }
    }

    return (
        <div className="content-view dictionary-view">
            <div className="view-header">
                <h2 className="view-title">Dictionary</h2>
                <p className="view-subtitle">Look up English words with Hindi meanings</p>
            </div>

            <div className="dict-search-wrap">
                <input
                    type="text"
                    className="dict-search-input"
                    placeholder="Type a word to look up..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                />
                <span className="dict-search-icon">{'\uD83D\uDD0D'}</span>
            </div>

            {result && (
                <div className="dict-card">
                    <div className="dict-card-header">
                        <div className="dict-word-container">
                            <h3 className="dict-word">{result.word}</h3>
                            <button
                                className={`dict-pronounce-btn ${isPlaying ? 'playing' : ''}`}
                                onClick={handlePronounce}
                                title="Listen to pronunciation"
                            >
                                🔊
                            </button>
                        </div>
                        <span className="dict-pos">{result.pos}</span>
                    </div>
                    {result.phonetic && <div className="dict-pronunciation">{result.phonetic}</div>}
                    <div className="dict-section">
                        <div className="dict-section-label">Meaning</div>
                        <div className="dict-section-text">{result.meaning_en}</div>
                    </div>
                    <div className="dict-section dict-hindi">
                        <div className="dict-section-label">{'\uD83C\uDDEE\uD83C\uDDF3'} Hindi</div>
                        <div className="dict-section-text">{result.meaning_hi}</div>
                    </div>
                    <div className="dict-section">
                        <div className="dict-section-label">Example</div>
                        <div className="dict-section-text dict-example">"{result.example}"</div>
                    </div>
                </div>
            )}

            {notFound && query.trim() && (
                <div className="dict-not-found">
                    <span className="dict-not-found-icon">{'\uD83E\uDD14'}</span>
                    <p>Word not found in offline dictionary.</p>
                    <p className="dict-not-found-hint">Try: hello, beautiful, important, opportunity, communicate</p>
                </div>
            )}

            {!query && (
                <div className="dict-categories-wrap" style={{ marginTop: '1rem' }}>
                    {Object.entries(wordsByCategory).map(([cat, words]) => (
                        <div key={cat} className="dict-category-section" style={{ marginBottom: '1.5rem' }}>
                            <div className="dict-suggestions-label" style={{ marginBottom: '0.5rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>{cat}</div>
                            <div className="dict-suggestions-grid">
                                {words.map(w => (
                                    <button key={w.word} className="dict-suggestion-chip" onClick={() => handleSearch(w.word)}>
                                        {w.word}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
