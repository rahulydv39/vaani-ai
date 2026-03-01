const fs = require('fs');
const path = require('path');

const words = [
    "ability", "able", "about", "above", "accept", "according", "account", "across", "act", "action",
    "activity", "actually", "add", "address", "administration", "admit", "adult", "affect", "after", "again",
    "against", "age", "agency", "agent", "ago", "agree", "agreement", "ahead", "air", "all",
    "allow", "almost", "alone", "along", "already", "also", "although", "always", "American", "among",
    "amount", "analysis", "and", "animal", "another", "answer", "any", "anyone", "anything", "appear",
    "apply", "approach", "area", "argue", "arm", "around", "arrive", "art", "article", "artist",
    "as", "ask", "assume", "at", "attack", "attention", "attorney", "audience", "author", "authority",
    "available", "avoid", "away", "baby", "back", "bad", "bag", "ball", "bank", "bar",
    "base", "be", "beat", "beautiful", "because", "become", "bed", "before", "begin", "behavior",
    "behind", "believe", "benefit", "best", "better", "between", "beyond", "big", "bill", "billion",
    "bit", "black", "blood", "blue", "board", "body", "book", "born", "both", "box",
    "boy", "break", "bring", "brother", "budget", "build", "building", "business", "but", "buy",
    "by", "call", "camera", "campaign", "can", "cancer", "candidate", "capital", "car", "card",
    "care", "career", "carry", "case", "catch", "cause", "cell", "center", "central", "century",
    "certain", "certainly", "chair", "challenge", "chance", "change", "character", "charge", "check", "child",
    "choice", "choose", "church", "citizen", "city", "civil", "claim", "class", "clear", "clearly",
    "close", "coach", "cold", "collection", "college", "color", "come", "commercial", "common", "community",
    "company", "compare", "computer", "concern", "condition", "conference", "Congress", "consider", "consumer", "contain",
    "continue", "control", "cost", "could", "country", "couple", "course", "court", "cover", "create",
    "crime", "cultural", "culture", "cup", "current", "customer", "cut", "dark", "data", "daughter",
    "day", "dead", "deal", "death", "debate", "decade", "decide", "decision", "deep", "defense",
    "degree", "Democrat", "democratic", "describe", "design", "despite", "detail", "determine", "develop", "development",
    "die", "difference", "different", "difficult", "dinner", "direction", "director", "discover", "discuss", "discussion",
    "disease", "do", "doctor", "dog", "door", "down", "draw", "dream", "drive", "drop",
    "drug", "during", "each", "early", "east", "easy", "eat", "economic", "economy", "edge",
    "education", "effect", "effort", "eight", "either", "election", "else", "employee", "end", "energy",
    "enjoy", "enough", "enter", "entire", "environment", "environmental", "especially", "establish", "even", "evening",
    "event", "ever", "every", "everybody", "everyone", "everything", "evidence", "exactly", "example", "executive",
    "exist", "expect", "experience", "expert", "explain", "eye", "face", "fact", "factor", "fail",
    "fall", "family", "far", "fast", "father", "fear", "federal", "feel", "feeling", "few",
    "field", "fight", "figure", "fill", "film", "final", "finally", "financial", "find", "fine",
    "finger", "finish", "fire", "firm", "first", "fish", "five", "floor", "fly", "focus",
    "follow", "food", "foot", "for", "force", "foreign", "forget", "form", "former", "forward",
    "four", "free", "friend", "from", "front", "full", "fund", "future", "game", "garden",
    "gas", "general", "generation", "get", "girl", "give", "glass", "go", "goal", "good",
    "government", "great", "green", "ground", "group", "grow", "growth", "guess", "gun", "guy",
    "hair", "half", "hand", "hang", "happen", "happy", "hard", "have", "he", "head",
    "health", "hear", "heart", "heat", "heavy", "help", "her", "here", "herself", "high",
    "him", "himself", "his", "history", "hit", "hold", "home", "hope", "hospital", "hot",
    "hotel", "hour", "house", "how", "however", "huge", "human", "hundred", "husband", "I",
    "idea", "identify", "if", "image", "imagine", "impact", "important", "improve", "in", "include",
    "including", "increase", "indeed", "indicate", "individual", "industry", "information", "inside", "instead", "institution",
    "interest", "interesting", "international", "interview", "into", "investment", "involve", "issue", "it", "item",
    "its", "itself", "job", "join", "just", "keep", "key", "kid", "kill", "kind",
    "kitchen", "know", "knowledge", "land", "language", "large", "last", "late", "later", "laugh",
    "law", "lawyer", "lay", "lead", "leader", "learn", "least", "leave", "left", "leg",
    "legal", "less", "let", "letter", "level", "lie", "life", "light", "like", "likely",
    "line", "list", "listen", "little", "live", "local", "long", "look", "lose", "loss",
    "lot", "love", "low", "machine", "magazine", "main", "maintain", "major", "majority", "make",
    "man", "manage", "management", "manager", "many", "market", "marriage", "material", "matter", "may",
    "maybe", "me", "mean", "measure", "media", "medical", "meet", "meeting", "member", "memory",
    "mention", "message", "method", "middle", "might", "military", "million", "mind", "minute", "miss",
    "mission", "model", "modern", "moment", "money", "month", "more", "morning", "most", "mother",
    "mouth", "move", "movement", "movie", "Mr", "Mrs", "much", "music", "must", "my",
    "myself", "name", "nation", "national", "natural", "nature", "near", "nearly", "necessary", "need",
    "network", "never", "new", "news", "newspaper", "next", "nice", "night", "no", "none",
    "nor", "north", "not", "note", "nothing", "notice", "now", "number", "occur",
    "of", "off", "offer", "office", "officer", "official", "often", "oh", "oil", "ok",
    "old", "on", "once", "one", "only", "onto", "open", "operation", "opportunity", "option",
    "or", "order", "organization", "other", "others", "our", "out", "outside", "over", "own",
    "owner", "page", "pain", "painting", "paper", "parent", "part", "participant", "particular", "particularly",
    "partner", "party", "pass", "past", "patient", "pattern", "pay", "peace", "people", "per",
    "perform", "performance", "perhaps", "period", "person", "personal", "phone", "physical", "pick", "picture",
    "piece", "place", "plan", "plant", "play", "player", "PM", "point", "police", "policy",
    "political", "politics", "poor", "popular", "population", "position", "positive", "possible", "power", "practice",
    "prepare", "present", "president", "pressure", "pretty", "prevent", "price", "private", "probably", "problem",
    "process", "produce", "product", "production", "professional", "professor", "program", "project", "property", "protect",
    "prove", "provide", "public", "pull", "purpose", "push", "put", "quality", "question", "quickly",
    "quite", "race", "radio", "raise", "range", "rate", "rather", "reach", "read", "ready",
    "real", "reality", "realize", "really", "reason", "receive", "recent", "recently", "recognize", "record",
    "red", "reduce", "reflect", "region", "relate", "relationship", "religious", "remain", "remember", "remove",
    "report", "represent", "Republican", "require", "research", "resource", "respond", "response", "responsibility", "rest",
    "result", "return", "reveal", "rich", "right", "rise", "risk", "road", "rock", "role",
    "room", "rule", "run", "safe", "same", "save", "say", "scene", "school", "science",
    "scientist", "score", "sea", "season", "seat", "second", "section", "security", "see", "seek",
    "seem", "sell", "send", "senior", "sense", "series", "serious", "serve", "service", "set",
    "seven", "several", "sex", "sexual", "shake", "share", "she", "shoot", "short", "should",
    "shoulder", "show", "side", "sign", "significant", "similar", "simple", "simply", "since", "sing",
    "single", "sister", "sit", "site", "situation", "six", "size", "skill", "skin", "small",
    "smile", "so", "social", "society", "soldier", "some", "somebody", "someone", "something", "sometimes",
    "son", "song", "soon", "sort", "sound", "source", "south", "southern", "space", "speak",
    "special", "specific", "speech", "spend", "sport", "spring", "staff", "stage", "stand", "standard",
    "star", "start", "state", "statement", "station", "stay", "step", "still", "stock", "stop",
    "store", "story", "strategy", "street", "strong", "structure", "student", "study", "stuff", "style",
    "subject", "success", "successful", "such", "suddenly", "suffer", "suggest", "summer", "support", "sure",
    "surface", "system", "table", "take", "talk", "task", "tax", "teach", "teacher", "team",
    "technology", "television", "tell", "ten", "tend", "term", "test", "than", "thank", "that",
    "the", "their", "them", "themselves", "then", "theory", "there", "these", "they", "thing",
    "think", "third", "this", "those", "though", "thought", "thousand", "threat", "three", "through",
    "throughout", "throw", "thus", "time", "to", "today", "together", "tonight", "too", "top",
    "total", "tough", "toward", "town", "trade", "traditional", "training", "travel", "treat", "treatment",
    "tree", "trial", "trip", "trouble", "true", "truth", "try", "turn", "TV", "two",
    "type", "under", "understand", "unit", "until", "up", "upon", "us", "use", "usually",
    "value", "various", "very", "victim", "view", "violence", "visit", "voice", "vote", "wait",
    "walk", "wall", "want", "war", "watch", "water", "way", "we", "weapon", "wear",
    "week", "weight", "well", "west", "western", "what", "whatever", "when", "where", "whether",
    "which", "while", "white", "who", "whole", "whom", "whose", "why", "wide", "wife",
    "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder",
    "word", "work", "worker", "world", "worry", "would", "write", "writer", "wrong", "yard",
    "yeah", "year", "yes", "yet", "you", "young", "your", "yourself",
    "abandon", "abolish", "absorb", "abuse", "accelerate", "accomplish", "accumulate", "achieve", "acquire", "adapt",
    "adjust", "administer", "advise", "advocate", "afford", "analyze", "announce", "anticipate", "apologize", "appeal",
    "appoint", "appreciate", "approve", "arrest", "assess", "assign", "assist", "associate", "assure", "attach",
    "attempt", "attend", "attract", "blame", "borrow", "bother", "calculate", "capture", "care", "celebrate",
    "characterize", "cheer", "choose", "clarify", "climb", "collect", "combine", "commit", "communicate", "compete",
    "complain", "complete", "complicate", "compose", "concentrate", "conclude", "confirm", "connect", "consist", "constitute",
    "construct", "consult", "consume", "contact", "contribute", "convince", "copy", "count", "crack", "crash",
    "crawl", "create", "cross", "cry", "dance", "dare", "deal", "decide", "declare", "decline",
    "decrease", "dedicate", "defend", "define", "delay", "deliver", "demand", "demonstrate", "deny", "depend",
    "depict", "derive", "descend", "describe", "deserve", "design", "desire", "destroy", "detect", "determine",
    "develop", "devote", "differ", "direct", "disagree", "disappear", "disappoint", "discover", "discuss", "display",
    "distinguish", "distribute", "divide", "document", "donate", "doubt", "drag", "draw", "dream", "dress",
    "drink", "drive", "drop", "earn", "eat", "educate", "effect", "eliminate", "embrace", "emerge",
    "emphasize", "employ", "enable", "encounter", "encourage", "engage", "enhance", "enjoy", "ensure", "enter",
    "entertain", "equip", "escape", "establish", "estimate", "evaluate", "examine", "exceed", "exchange", "exclude",
    "excuse", "execute", "exercise", "exhibit", "exist", "expand", "expect", "experience", "explain", "explore",
    "expose", "express", "extend", "face", "fail", "fall", "fancy", "fear", "feature", "feel",
    "file", "fill", "film", "finance", "find", "finish", "fire", "fit", "fix", "flash",
    "flee", "float", "flow", "fly", "focus", "fold", "follow", "forget", "form", "found",
    "function", "gain", "gather", "generate", "get", "give", "glance", "go", "govern", "grab",
    "grant", "greet", "grow", "guarantee", "guard", "guess", "guide", "handle", "happen", "hate",
    "have", "head", "hear", "help", "hesitate", "hide", "hire", "hit", "hold", "hope",
    "host", "hunt", "hurry", "hurt", "identify", "ignore", "illustrate", "imagine", "imply", "import",
    "impose", "improve", "include", "incorporate", "increase", "indicate", "influence", "inform", "initiate", "injure",
    "insist", "inspect", "inspire", "install", "instruct", "intend", "interest", "interfere", "interpret", "introduce",
    "invest", "investigate", "invite", "involve", "issue", "join", "judge", "jump", "justify", "keep",
    "kick", "kiss", "knock", "know", "lack", "last", "laugh", "launch", "lead", "learn",
    "leave", "lend", "let", "level", "license", "lie", "lift", "light", "limit", "link"
];

const posTypes = ['noun', 'verb', 'adjective', 'adverb'];

const getRandomPos = () => posTypes[Math.floor(Math.random() * posTypes.length)];
const getHindi = (w) => `Hindi meaning of '${w}'`;
const getMeaning = (w) => `English meaning of '${w}'`;
const getExample = (w) => `Here is an example sentence using the word ${w}.`;
const getPhonetic = (w) => `/${w}/`;

const dict = {};

// Deduplicate words and build basic dictionary
const uniqueWords = [...new Set(words)];

uniqueWords.forEach(w => {
    const char = w.charAt(0);
    const capitalized = char.toUpperCase() + w.slice(1);
    dict[w] = {
        word: capitalized,
        pos: getRandomPos(),
        meaning: getMeaning(w),
        hindi: getHindi(w),
        example: getExample(w),
        phonetic: getPhonetic(w)
    };
});

// Overwrite with some high-quality real-world entries
const realEntries = {
    "hello": { word: 'Hello', pos: 'interjection', phonetic: '/həˈloʊ/', meaning: 'Used as a greeting when meeting someone.', hindi: 'नमस्ते (Namaste)', example: 'Hello! How are you doing today?' },
    "thank": { word: 'Thank', pos: 'verb', phonetic: '/θæŋk/', meaning: 'Express gratitude to someone.', hindi: 'धन्यवाद (Dhanyavaad)', example: 'I want to thank you for your help.' },
    "please": { word: 'Please', pos: 'adverb', phonetic: '/pliːz/', meaning: 'Used to add politeness to a request.', hindi: 'कृपया (Kripaya)', example: 'Could you please pass the salt?' },
    "understand": { word: 'Understand', pos: 'verb', phonetic: '/ˌʌndərˈstænd/', meaning: 'To perceive the meaning of something.', hindi: 'समझना (Samajhna)', example: 'I understand the lesson now.' },
    "beautiful": { word: 'Beautiful', pos: 'adjective', phonetic: '/ˈbjuːtɪfəl/', meaning: 'Pleasing to the senses or mind aesthetically.', hindi: 'सुंदर (Sundar)', example: 'The sunset was truly beautiful.' },
    "important": { word: 'Important', pos: 'adjective', phonetic: '/ɪmˈpɔːrtənt/', meaning: 'Of great significance or value.', hindi: 'महत्वपूर्ण (Mahatvapurn)', example: 'Education is very important for success.' },
    "opportunity": { word: 'Opportunity', pos: 'noun', phonetic: '/ˌɑːpərˈtuːnəti/', meaning: 'A set of circumstances that makes it possible to do something.', hindi: 'अवसर (Avsar)', example: 'This job is a great opportunity for growth.' },
    "experience": { word: 'Experience', pos: 'noun', phonetic: '/ɪkˈspɪriəns/', meaning: 'Practical contact with and observation of facts or events.', hindi: 'अनुभव (Anubhav)', example: 'She has five years of teaching experience.' },
    "communicate": { word: 'Communicate', pos: 'verb', phonetic: '/kəˈmjuːnɪkeɪt/', meaning: 'To share or exchange information, ideas, or feelings.', hindi: 'संवाद करना (Samvad karna)', example: 'It is important to communicate clearly.' },
    "improve": { word: 'Improve', pos: 'verb', phonetic: '/ɪmˈpruːv/', meaning: 'To make or become better.', hindi: 'सुधार करना (Sudhaar karna)', example: 'Practice will improve your English skills.' },
    "knowledge": { word: 'Knowledge', pos: 'noun', phonetic: '/ˈnɑːlɪdʒ/', meaning: 'Facts, information, and skills acquired through experience or education.', hindi: 'ज्ञान (Gyaan)', example: 'Knowledge is power.' },
    "confidence": { word: 'Confidence', pos: 'noun', phonetic: '/ˈkɑːnfɪdəns/', meaning: 'The feeling of self-assurance arising from one\'s abilities.', hindi: 'आत्मविश्वास (Aatmavishvas)', example: 'Speaking practice builds confidence.' },
    "accept": { word: 'Accept', pos: 'verb', phonetic: '/əkˈsɛpt/', meaning: 'Consent to receive or undertake something offered.', hindi: 'स्वीकार करना (Sveekar karna)', example: 'I accept your apology.' },
    "achieve": { word: 'Achieve', pos: 'verb', phonetic: '/əˈtʃiːv/', meaning: 'Successfully bring about or reach a desired objective, level, or result by effort.', hindi: 'प्राप्त करना (Praapt karna)', example: 'You can achieve anything if you work hard.' },
    "appreciate": { word: 'Appreciate', pos: 'verb', phonetic: '/əˈpriːʃieɪt/', meaning: 'Recognize the full worth of.', hindi: 'तारीफ करना (Taareef karna)', example: 'I appreciate your help with this project.' },
    "believe": { word: 'Believe', pos: 'verb', phonetic: '/bɪˈliːv/', meaning: 'Accept that something is true.', hindi: 'विश्वास करना (Vishvaas karna)', example: 'I believe in your potential.' },
    "courage": { word: 'Courage', pos: 'noun', phonetic: '/ˈkɜːrɪdʒ/', meaning: 'The ability to do something that frightens one.', hindi: 'साहस (Saahas)', example: 'It took courage to speak the truth.' },
    "decide": { word: 'Decide', pos: 'verb', phonetic: '/dɪˈsaɪd/', meaning: 'Come to a resolution in the mind as a result of consideration.', hindi: 'निर्णय लेना (Nirnay lena)', example: 'I need to decide what to wear.' },
    "effort": { word: 'Effort', pos: 'noun', phonetic: '/ˈɛfərt/', meaning: 'A vigorous or determined attempt.', hindi: 'प्रयास (Prayaas)', example: 'He put a lot of effort into the project.' },
    "friendly": { word: 'Friendly', pos: 'adjective', phonetic: '/ˈfrɛndli/', meaning: 'Kind and pleasant.', hindi: 'दोस्ताना (Dostana)', example: 'Everyone in the town is very friendly.' }
};

Object.keys(realEntries).forEach(k => {
    dict[k] = realEntries[k];
});

const dir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, 'dictionary.json'), JSON.stringify(dict, null, 2));

console.log('Dictionary dataset created with ' + Object.keys(dict).length + ' words');
