import { useState } from 'react'

const CHAPTERS = [
    {
        id: 'tenses',
        title: 'Tenses (काल)',
        icon: '⏱️',
        sections: [
            {
                title: 'Present Continuous (वर्तमान काल)',
                explanation: 'Use: Jab koi kaam abhi isi waqt ho raha ho. (For actions happening right now).',
                structure: 'Subject + is/am/are + verb-ing',
                examples: [
                    { en: 'I am reading a book.', hi: 'मैं किताब पढ़ रहा हूँ।' },
                    { en: 'They are playing outside.', hi: 'वे बाहर खेल रहे हैं।' },
                    { en: 'She is not working today.', hi: 'वह आज काम नहीं कर रही है।' },
                ],
            },
            {
                title: 'Present Simple (सामान्य वर्तमान)',
                explanation: 'Use: Aadatein (habits), rozmara ke kaam (routines), ya sach (facts) batane ke liye.',
                structure: 'Subject + Verb (s/es for he/she/it)',
                examples: [
                    { en: 'She plays tennis every Sunday.', hi: 'वह हर रविवार टेनिस खेलती है।' },
                    { en: 'The sun rises in the east.', hi: 'सूरज पूर्व से उगता है।' },
                    { en: 'I do not like coffee.', hi: 'मुझे कॉफी पसंद नहीं है।' },
                ],
            },
            {
                title: 'Past Simple (भूतकाल)',
                explanation: 'Use: Jo kaam pichli baar poora ho chuka hai (Completed actions in the past).',
                structure: 'Subject + Verb (second form/past tense)',
                examples: [
                    { en: 'I visited my grandmother yesterday.', hi: 'मैं कल अपनी दादी से मिलने गया था।' },
                    { en: 'He went to the market.', hi: 'वह बाज़ार गया था।' },
                    { en: 'We did not watch the movie.', hi: 'हमने फिल्म नहीं देखी।' },
                ],
            },
            {
                title: 'Future Simple (भविष्यत काल)',
                explanation: 'Use: Aage aane wale time ki baat karna (Predictions, spontaneous decisions).',
                structure: 'Subject + will + base verb',
                examples: [
                    { en: 'I will call you tomorrow.', hi: 'मैं तुम्हें कल कॉल करूँगा।' },
                    { en: 'It will rain this evening.', hi: 'आज शाम बारिश होगी।' },
                    { en: 'She will not forget the meeting.', hi: 'वह मीटिंग नहीं भूलेगी।' },
                ],
            },
        ],
    },
    {
        id: 'prepositions',
        title: 'Prepositions (सम्बन्धवाचक अव्यय)',
        icon: '📍',
        sections: [
            {
                title: 'Prepositions of Time (समय)',
                explanation: 'Use: "at" exact time ke liye, "on" din/date ke liye, aur "in" mahine/saal ke liye.',
                structure: 'at 3 PM, on Monday, in 2024',
                examples: [
                    { en: 'The meeting is at 3 PM.', hi: 'मीटिंग दोपहर 3 बजे है।' },
                    { en: 'My birthday is on March 15th.', hi: 'मेरा जन्मदिन 15 मार्च को है।' },
                    { en: 'It snows a lot in winter.', hi: 'सर्दियों में बहुत बर्फ गिरती है।' },
                ],
            },
            {
                title: 'Prepositions of Place (स्थान)',
                explanation: 'Use: "at" specific jagah ke liye, "on" kisi surface ke upar, "in" andar ke liye.',
                structure: 'at the door, on the table, in the room',
                examples: [
                    { en: 'She is at the door.', hi: 'वह दरवाज़े पर है।' },
                    { en: 'The book is on the shelf.', hi: 'किताब शेल्फ पर है।' },
                    { en: 'He lives in a small apartment.', hi: 'वह एक छोटे से अपार्टमेंट में रहता है।' },
                ],
            },
        ],
    },
    {
        id: 'articles',
        title: 'Articles (A, An, The)',
        icon: '📚',
        sections: [
            {
                title: 'Definite Article: The',
                explanation: 'Use: Jab hum kisi khaas cheez ya insaan ki baat karte hain, jiske baare me sunne wale ko pehle se pata ho.',
                structure: 'The + specific noun',
                examples: [
                    { en: 'The book on the table is mine.', hi: 'मेज़ पर रखी (वह खास) किताब मेरी है।' },
                    { en: 'I saw the movie you recommended.', hi: 'मैंने वह फिल्म देखी जो तुमने सुझाई थी।' },
                ],
            },
            {
                title: 'Indefinite Articles: A / An',
                explanation: 'Use: "A" consonants se pehle, "An" vowels (a, e, i, o, u ki sound) se pehle lagta hai. Jab hum kisi aam cheez ki baat karte hain.',
                structure: 'A pen, An apple',
                examples: [
                    { en: 'I need a pen.', hi: 'मुझे एक पेन चाहिए (कोई भी पेन)।' },
                    { en: 'She is an engineer.', hi: 'वह एक इंजीनियर है।' },
                ],
            },
        ],
    },
    {
        id: 'modals',
        title: 'Modal Verbs (कैन, शुड, मस्ट)',
        icon: '💡',
        sections: [
            {
                title: 'Can / Could',
                explanation: 'Use: "Can" kshamta (ability) ya ijazaat (permission) dikhata hai. "Could" iska past ya polite tareeqa hai.',
                structure: 'Subject + can/could + base verb',
                examples: [
                    { en: 'I can swim very well.', hi: 'मैं बहुत अच्छी तरह तैर सकता हूँ।' },
                    { en: 'Could you please open the window?', hi: 'क्या आप कृप्या खिड़की खोल देंगे?' },
                ],
            },
            {
                title: 'Should / Must',
                explanation: 'Use: "Should" salah (advice) dene ke liye. "Must" zaroori kaam (obligation) batane ke liye.',
                structure: 'Subject + should/must + base verb',
                examples: [
                    { en: 'You should eat more vegetables.', hi: 'तुम्हें ज्यादा सब्जियां खानी चाहिए।' },
                    { en: 'You must wear a seatbelt.', hi: 'तुम्हें सीटबेल्ट जरूर पहनना होगा।' },
                ],
            },
        ],
    },
    {
        id: 'conjunctions',
        title: 'Conjunctions (संयोजक)',
        icon: '🔗',
        sections: [
            {
                title: 'And, But, Or',
                explanation: 'Use: "And" jodne ke liye, "But" virodh ya antar (contrast) batane ke liye, "Or" vikalp (choice) dene ke liye.',
                structure: 'Word1 + Conjunction + Word2',
                examples: [
                    { en: 'I like apples and bananas.', hi: 'मुझे सेब और केले पसंद हैं।' },
                    { en: 'He is smart but lazy.', hi: 'वह होशियार है लेकिन आलसी है।' },
                    { en: 'Do you want tea or coffee?', hi: 'क्या आप चाय लेंगे या कॉफी?' },
                ],
            },
            {
                title: 'Because / So',
                explanation: 'Use: "Because" kaaran (reason) batane ke liye. "So" nateeja (result) batane ke liye.',
                structure: 'Statement 1 + Because/So + Statement 2',
                examples: [
                    { en: 'I stayed home because it was raining.', hi: 'मैं घर पर रहा क्योंकि बारिश हो रही थी।' },
                    { en: 'It was raining, so I stayed home.', hi: 'बारिश हो रही थी, इसलिए मैं घर पर रहा।' },
                ],
            },
        ],
    },
    {
        id: 'pronouns',
        title: 'Pronouns (सर्वनाम)',
        icon: '👤',
        sections: [
            {
                title: 'Subject and Object Pronouns',
                explanation: 'Use: Noun ki jagah par istemaal hone wale shabd. Jaise: I, me, he, him, they, them.',
                structure: 'Subject Pronoun ... Object Pronoun',
                examples: [
                    { en: 'I know him.', hi: 'मैं उसे जानता हूँ।' },
                    { en: 'She called us yesterday.', hi: 'उसने कल हमें बुलाया था।' },
                ],
            },
            {
                title: 'Possessive Pronouns',
                explanation: 'Use: Adhikar (ownership) dikhane ke liye. Jaise: my, mine, your, yours, his, her, their.',
                structure: 'Possessive Pronoun + Noun',
                examples: [
                    { en: 'This is my book.', hi: 'यह मेरी किताब है।' },
                    { en: 'That car is theirs.', hi: 'वह कार उनकी है।' },
                ],
            },
        ],
    },
]

export function GrammarView({ onStartQuiz }) {
    const [openChapter, setOpenChapter] = useState(null)

    return (
        <div className="content-view grammar-view">
            <div className="view-header">
                <h2 className="view-title">Grammar Chapters</h2>
                <p className="view-subtitle">Master English grammar step by step</p>
            </div>

            <div className="grammar-chapters">
                {CHAPTERS.map(chapter => (
                    <div
                        key={chapter.id}
                        className={`grammar-chapter ${openChapter === chapter.id ? 'grammar-chapter-open' : ''}`}
                    >
                        <button
                            className="grammar-chapter-header"
                            onClick={() => setOpenChapter(openChapter === chapter.id ? null : chapter.id)}
                        >
                            <span className="grammar-chapter-icon">{chapter.icon}</span>
                            <span className="grammar-chapter-title">{chapter.title}</span>
                            <span className="grammar-chapter-count">{chapter.sections.length} topics</span>
                            <span className="grammar-chapter-arrow">{openChapter === chapter.id ? '\u25B2' : '\u25BC'}</span>
                        </button>

                        {openChapter === chapter.id && (
                            <div className="grammar-chapter-body">
                                {chapter.sections.map((section, idx) => (
                                    <div key={idx} className="grammar-section">
                                        <h4 className="grammar-section-title">{section.title}</h4>
                                        <p className="grammar-section-text">{section.explanation}</p>

                                        {section.structure && (
                                            <div className="grammar-structure">
                                                <strong>Structure:</strong> <code>{section.structure}</code>
                                            </div>
                                        )}

                                        <div className="grammar-examples">
                                            {section.examples.map((ex, i) => (
                                                <div key={i} className="grammar-example-box">
                                                    <div className="grammar-example-en">{ex.en}</div>
                                                    <div className="grammar-example-hi">{ex.hi}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button className="btn btn-primary grammar-quiz-btn" onClick={() => onStartQuiz?.(chapter.id)}>
                                    Start {chapter.title} Quiz
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
