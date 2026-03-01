// grammarData.js
// 10 Detailed English Grammar Chapters with Hindi explanations and robust Quizzes.

export const grammarData = [
    {
        id: 'tenses',
        title: 'Tenses (काल)',
        desc: 'Learn Present, Past, and Future tenses.',
        sections: [
            {
                sub: 'Present Continuous (वर्तमान काल)',
                use: 'Jab koi kaam abhi isi waqt ho raha ho. (Actions happening right now).',
                structure: 'Subject + is/am/are + verb-ing',
                examples: [
                    { eng: 'I am reading a book.', hin: 'मैं किताब पढ़ रहा हूँ।' },
                    { eng: 'They are playing outside.', hin: 'वे बाहर खेल रहे हैं।' }
                ]
            },
            {
                sub: 'Present Simple (सामान्य वर्तमान)',
                use: 'Aadatein (habits), rozmara ke kaam (routines), ya sach (facts) batane ke liye.',
                structure: 'Subject + Verb (s/es)',
                examples: [
                    { eng: 'She plays tennis every Sunday.', hin: 'वह हर रविवार टेनिस खेलती है।' },
                    { eng: 'Water boils at 100 degrees.', hin: 'पानी 100 डिग्री पर उबलता है।' }
                ]
            },
            {
                sub: 'Past Simple (भूतकाल)',
                use: 'Jab koi kaam beete hue samay mein poora ho chuka ho.',
                structure: 'Subject + Verb 2nd Form',
                examples: [
                    { eng: 'I saw him yesterday.', hin: 'मैंने उसे कल देखा।' },
                    { eng: 'We went to the market.', hin: 'हम बाज़ार गए थे।' }
                ]
            }
        ],
        quiz: [
            { q: "Translate: 'मैं किताब पढ़ रहा हूँ।'", opts: ["I read a book.", "I am reading a book.", "I was reading a book."], ans: 1 },
            { q: "Identify the tense: 'She plays tennis every Sunday.'", opts: ["Present Continuous", "Past Simple", "Present Simple"], ans: 2 },
            { q: "Choose correct past tense: 'We ___ to the market.'", opts: ["go", "went", "gone"], ans: 1 },
            { q: "Translate: 'मैंने उसे कल देखा।'", opts: ["I see him yesterday.", "I saw him yesterday.", "I had seen him yesterday."], ans: 1 },
            { q: "Identify the tense: 'They are playing outside.'", opts: ["Present Continuous", "Present Simple", "Future Continuous"], ans: 0 },
        ]
    },
    {
        id: 'prepositions',
        title: 'Prepositions (संबंधसूचक)',
        desc: 'Learn In, On, At, Under rules for time and place.',
        sections: [
            {
                sub: 'In (अंदर / में)',
                use: 'Jab koi cheez kisi band (enclosed) jagah ke andar ho ya mahine/saal ke liye.',
                structure: 'Noun + in + Place/Time',
                examples: [
                    { eng: 'The keys are in my pocket.', hin: 'चाबियां मेरी जेब में हैं।' },
                    { eng: 'She was born in 1999.', hin: 'उनका जन्म 1999 में हुआ था।' }
                ]
            },
            {
                sub: 'On (ऊपर / पर)',
                use: 'Kisi satah (surface) ke upar hone ya dino (days) ke liye.',
                structure: 'Noun + on + Surface/Day',
                examples: [
                    { eng: 'The book is on the table.', hin: 'किताब मेज पर है।' },
                    { eng: 'We will meet on Sunday.', hin: 'हम रविवार को मिलेंगे।' }
                ]
            },
            {
                sub: 'At (पर / में)',
                use: 'Exact location, chhoti jagah, ya specific time batane ke liye.',
                structure: 'Used before exact points.',
                examples: [
                    { eng: 'I will meet you at 5 PM.', hin: 'मैं तुमसे शाम 5 बजे मिलूंगा।' },
                    { eng: 'He is at the bus stop.', hin: 'वह बस स्टॉप पर है।' }
                ]
            }
        ],
        quiz: [
            { q: "The book is ___ the table.", opts: ["in", "on", "at"], ans: 1 },
            { q: "She was born ___ 1999.", opts: ["at", "on", "in"], ans: 2 },
            { q: "I will meet you ___ 5 PM.", opts: ["in", "on", "at"], ans: 2 },
            { q: "He is standing ___ the bus stop.", opts: ["in", "on", "at"], ans: 2 },
            { q: "We have a holiday ___ Monday.", opts: ["on", "in", "at"], ans: 0 },
        ]
    },
    {
        id: 'articles',
        title: 'Articles (A, An, The)',
        desc: 'Learn when to specify nouns exactly or generically.',
        sections: [
            {
                sub: 'A / An (एक)',
                use: 'Kisi aam (general) ek vachan noun ke aage. "An" vowel sound (a,e,i,o,u) wale shabdo ke aage lagta hai.',
                structure: 'A/An + Singular Noun',
                examples: [
                    { eng: 'I saw a dog.', hin: 'मैंने एक कुत्ता देखा।' },
                    { eng: 'She ate an apple.', hin: 'उसने एक सेब खाया।' }
                ]
            },
            {
                sub: 'The (वह / निश्चित)',
                use: 'Jab hum kisi khaas ya specified cheez ki baat karte hain jiske baare mein sunne wale ko pata ho.',
                structure: 'The + Specific Noun',
                examples: [
                    { eng: 'The dog I saw was black.', hin: 'जो कुत्ता मैंने देखा वह काला था।' },
                    { eng: 'The sun is hot.', hin: 'सूरज गर्म है।' }
                ]
            }
        ],
        quiz: [
            { q: "She ate ___ apple.", opts: ["a", "an", "the"], ans: 1 },
            { q: "I bought ___ new car yesterday.", opts: ["a", "an", "the"], ans: 0 },
            { q: "___ sun is very hot today.", opts: ["A", "An", "The"], ans: 2 },
            { q: "I have ___ idea!", opts: ["a", "an", "the"], ans: 1 },
            { q: "Please shut ___ door.", opts: ["a", "an", "the"], ans: 2 },
            { q: "He is ___ honest man.", opts: ["a", "an", "the"], ans: 1 },
        ]
    },
    {
        id: 'modals',
        title: 'Modal Verbs (Can, Should, Must)',
        desc: 'Express ability, advice, and obligation.',
        sections: [
            {
                sub: 'Can / Could (सकना)',
                use: 'Kshamata (Ability) aur ijaajat (permission) dikhane ke liye.',
                structure: 'Subject + Can/Could + Verb 1st Form',
                examples: [
                    { eng: 'I can speak English.', hin: 'मैं अंग्रेजी बोल सकता हूँ।' },
                    { eng: 'Could you help me?', hin: 'क्या आप मेरी मदद कर सकते हैं?' }
                ]
            },
            {
                sub: 'Should (चाहिए)',
                use: 'Salah (advice) dene ya lene ke liye.',
                structure: 'Subject + Should + Verb 1st Form',
                examples: [
                    { eng: 'You should sleep early.', hin: 'तुम्हें जल्दी सोना चाहिए।' },
                    { eng: 'What should I do?', hin: 'मुझे क्या करना चाहिए?' }
                ]
            },
            {
                sub: 'Must (ज़रूर चाहिए)',
                use: 'Zarurat ya farz (strong obligation) dikhane ke liye.',
                structure: 'Subject + Must + Verb 1st Form',
                examples: [
                    { eng: 'You must wear a helmet.', hin: 'तुम्हें हेलमेट ज़रूर पहनना चाहिए।' }
                ]
            }
        ],
        quiz: [
            { q: "___ I come in?", opts: ["Should", "Must", "Can"], ans: 2 },
            { q: "You look tired. You ___ rest.", opts: ["can", "should", "could"], ans: 1 },
            { q: "Students ___ wear uniforms.", opts: ["can", "must", "could"], ans: 1 },
            { q: "___ you speak French?", opts: ["Can", "Should", "Must"], ans: 0 },
            { q: "I ___ help you with that.", opts: ["must", "can", "should"], ans: 1 },
        ]
    },
    {
        id: 'conjunctions',
        title: 'Conjunctions (समुच्चयबोधक)',
        desc: 'Connecting words (And, But, Or, Because).',
        sections: [
            {
                sub: 'And / But (और / लेकिन)',
                use: 'Milte-julte terms ko "And" jodta hai. Viprit (opposite) terms ko "But" jodta hai.',
                structure: 'Sentence 1 + Conjunction + Sentence 2',
                examples: [
                    { eng: 'I like tea and coffee.', hin: 'मुझे चाय और कॉफ़ी पसंद है।' },
                    { eng: 'I ran fast but missed the train.', hin: 'मैं तेज़ दौड़ा लेकिन ट्रेन छूट गई।' }
                ]
            },
            {
                sub: 'Because (क्योंकि)',
                use: 'Kaaran (Reason) batane ke liye.',
                structure: 'Action + Because + Reason',
                examples: [
                    { eng: 'I am tired because I worked hard.', hin: 'मैं थका हुआ हूँ क्योंकि मैंने कड़ी मेहनत की।' }
                ]
            },
            {
                sub: 'Or (या)',
                use: 'Vikalp (Choice) batane ke liye.',
                structure: 'Choice 1 + Or + Choice 2',
                examples: [
                    { eng: 'Do you want tea or coffee?', hin: 'क्या आप चाय लेंगे या कॉफ़ी?' }
                ]
            }
        ],
        quiz: [
            { q: "I like dogs, ___ I don't like cats.", opts: ["and", "but", "because"], ans: 1 },
            { q: "I stayed home ___ it was raining.", opts: ["but", "or", "because"], ans: 2 },
            { q: "Would you like water ___ juice?", opts: ["and", "or", "but"], ans: 1 },
            { q: "She is smart ___ hardworking.", opts: ["and", "because", "but"], ans: 0 },
            { q: "I couldn't sleep ___ of the noise.", opts: ["or", "but", "because"], ans: 2 },
        ]
    },
    {
        id: 'adjectives',
        title: 'Adjectives (विशेषण)',
        desc: 'Describing words showing quality.',
        sections: [
            {
                sub: 'Qualitative Adjectives',
                use: 'Kisi ki khasiyat ya swabhav batana.',
                structure: 'Adjective + Noun OR Noun + is + Adjective',
                examples: [
                    { eng: 'He is a brave boy.', hin: 'वह एक बहादुर लड़का है।' },
                    { eng: 'The sky is blue.', hin: 'आसमान नीला है।' }
                ]
            },
            {
                sub: 'Comparative & Superlative',
                use: 'Tulna (Comparison) karne ke liye. (Tall - Taller - Tallest).',
                structure: 'A is Taller than B / A is the Tallest',
                examples: [
                    { eng: 'Ram is taller than Shyam.', hin: 'राम श्याम से लम्बा है।' },
                    { eng: 'Everest is the highest mountain.', hin: 'एवरेस्ट सबसे ऊँचा पर्वत है।' }
                ]
            }
        ],
        quiz: [
            { q: "She is a ___ girl.", opts: ["beautifully", "beauty", "beautiful"], ans: 2 },
            { q: "An elephant is ___ than a dog.", opts: ["big", "bigger", "biggest"], ans: 1 },
            { q: "This is the ___ book I have read.", opts: ["good", "better", "best"], ans: 2 },
            { q: "He ran ___ than me.", opts: ["fast", "faster", "fastest"], ans: 1 },
            { q: "The soup is very ___.", opts: ["hot", "hotter", "hottest"], ans: 0 },
        ]
    },
    {
        id: 'pronouns',
        title: 'Pronouns (सर्वनाम)',
        desc: 'Words replacing nouns (He, She, It, They).',
        sections: [
            {
                sub: 'Subject Pronouns (I, We, He, She, They)',
                use: 'Jo kaam (action) kar raha ho uske naam ki jagah.',
                structure: 'Pronoun (Sub) + Verb',
                examples: [
                    { eng: 'Rahul is my friend. He is smart.', hin: 'राहुल मेरा दोस्त है। वह होशियार है।' }
                ]
            },
            {
                sub: 'Object Pronouns (Me, Us, Him, Her, Them)',
                use: 'Jis par kaam/action ka asar ho.',
                structure: 'Verb + Pronoun (Obj)',
                examples: [
                    { eng: 'I called her yesterday.', hin: 'मैंने उसे कल फ़ोन किया था।' }
                ]
            },
            {
                sub: 'Possessive (My, Our, His, Their)',
                use: 'Haq ya Malikana (ownership) dikhane ke liye.',
                structure: 'Possessive + Noun',
                examples: [
                    { eng: 'This is my bag.', hin: 'यह मेरा बैग है।' }
                ]
            }
        ],
        quiz: [
            { q: "___ are going to the movie.", opts: ["Them", "Their", "We"], ans: 2 },
            { q: "Please give the book to ___.", opts: ["he", "him", "his"], ans: 1 },
            { q: "Is this ___ pencil?", opts: ["you", "your", "yours"], ans: 1 },
            { q: "I saw ___ at the mall.", opts: ["they", "them", "their"], ans: 1 },
            { q: "___ is raining outside.", opts: ["It", "He", "They"], ans: 0 },
        ]
    },
    {
        id: 'adverbs',
        title: 'Adverbs (क्रियाविशेषण)',
        desc: 'Describing how actions are done.',
        sections: [
            {
                sub: 'Manner (Kaise hua/How)',
                use: 'Kaam kis tareeqe se hua, jaise Quickly, Slowly, Beautifully.',
                structure: 'Verb + Adverb',
                examples: [
                    { eng: 'He ran fast.', hin: 'वह तेज़ दौड़ा।' },
                    { eng: 'She sings beautifully.', hin: 'वह बहुत सुंदर गाती है।' }
                ]
            },
            {
                sub: 'Frequency (Kitni baar/How often)',
                use: 'Kaam kitni baar hota hai, jaise Always, Sometimes, Never.',
                structure: 'Subject + Adverb + Verb',
                examples: [
                    { eng: 'I always wake up early.', hin: 'मैं हमेशा जल्दी उठता हूँ।' },
                    { eng: 'She never lies.', hin: 'वह कभी झूठ नहीं बोलती।' }
                ]
            }
        ],
        quiz: [
            { q: "The old man walked ___.", opts: ["slow", "slowly", "slowness"], ans: 1 },
            { q: "She ___ gets angry.", opts: ["never", "ever", "anyway"], ans: 0 },
            { q: "He speaks English ___.", opts: ["fluent", "fluency", "fluently"], ans: 2 },
            { q: "I have ___ finished my work.", opts: ["already", "yet", "still"], ans: 0 },
            { q: "They played ___ in the match.", opts: ["bad", "badly", "worse"], ans: 1 },
        ]
    },
    {
        id: 'voice',
        title: 'Active / Passive Voice',
        desc: 'Focusing on the subject or the action.',
        sections: [
            {
                sub: 'Active Voice (कर्तृवाच्य)',
                use: 'Jab subject khud kaam karta hai.',
                structure: 'Subject + Verb + Object',
                examples: [
                    { eng: 'Ram writes a letter.', hin: 'राम पत्र लिखता है।' }
                ]
            },
            {
                sub: 'Passive Voice (कर्मवाच्य)',
                use: 'Jab asar ya kaam (action) par zyada dhyan dena ho, ya subject pata na ho.',
                structure: 'Object + forms of "to be" + Past Participle (V3)',
                examples: [
                    { eng: 'A letter is written by Ram.', hin: 'एक पत्र राम के द्वारा लिखा जाता है।' },
                    { eng: 'The building was built in 1990.', hin: 'इमारत 1990 में बनाई गई थी।' }
                ]
            }
        ],
        quiz: [
            { q: "Active or Passive? 'The cheese was eaten by the mouse.'", opts: ["Active", "Passive", "None"], ans: 1 },
            { q: "Filter into Passive: 'I ate an apple.' -> 'An apple ___ by me.'", opts: ["was eaten", "is eaten", "ate"], ans: 0 },
            { q: "Identify Active Voice.", opts: ["The car is washed.", "John washes the car.", "The car was washed by John."], ans: 1 },
            { q: "'The song is sung.' - This is in ___ voice.", opts: ["Active", "Passive", "Future"], ans: 1 },
            { q: "Change to Passive: 'He helps me.' -> 'I __ by him.'", opts: ["was helped", "am helped", "helped"], ans: 1 },
        ]
    },
    {
        id: 'speech',
        title: 'Direct / Indirect Speech',
        desc: 'Reporting what someone else said.',
        sections: [
            {
                sub: 'Direct Speech (प्रत्यक्ष कथन)',
                use: 'Kisi vyakti ke boley gaye shabdo ko bilkul waise hi (quote) batana.',
                structure: 'He said, "I am happy."',
                examples: [
                    { eng: 'Rahul said, "I am going to school."', hin: 'राहुल ने कहा, "मैं स्कूल जा रहा हूँ।"' }
                ]
            },
            {
                sub: 'Indirect Speech (अप्रत्यक्ष कथन)',
                use: 'Baat ko apne shabdon mein report karna, quotes hatakar.',
                structure: 'He said that he was happy.',
                examples: [
                    { eng: 'Rahul said that he was going to school.', hin: 'राहुल ने कहा कि वह स्कूल जा रहा था।' }
                ]
            }
        ],
        quiz: [
            { q: "Indirect of: She said, 'I am tired.'", opts: ["She says she is tired.", "She said she was tired.", "She said I am tired."], ans: 1 },
            { q: "Indirect of: They said, 'We won!'", opts: ["They said that we won.", "They said that they had won.", "They say they win."], ans: 1 },
            { q: "Identify Speech: He said he would come later.", opts: ["Direct", "Indirect", "Passive"], ans: 1 },
            { q: "Convert to Direct: He told me that he was busy.", opts: ["He told, 'He is busy.'", "He said to me, 'I am busy.'", "He said, 'I was busy.'"], ans: 1 },
            { q: "Indirect of: 'I love apples,' said Mary.", opts: ["Mary said that I love apples.", "Mary said that she loves apples.", "Mary said that she loved apples."], ans: 2 },
        ]
    }
];
