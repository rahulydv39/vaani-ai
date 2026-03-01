import fs from 'fs';

const categoriesMap = {
    'Time & Dates': ['time', 'day', 'month', 'year', 'today', 'tomorrow', 'yesterday', 'morning', 'night', 'evening', 'week', 'hour', 'minute', 'second', 'monday', 'tuesday', 'sunday'],
    'People & Family': ['he', 'she', 'they', 'boy', 'girl', 'man', 'woman', 'mother', 'father', 'sister', 'brother', 'friend', 'people', 'family', 'child', 'children', 'person'],
    'Actions (Verbs)': ['can', 'will', 'run', 'walk', 'eat', 'sleep', 'talk', 'speak', 'look', 'see', 'make', 'do', 'go', 'come', 'take', 'get', 'use', 'find', 'give', 'tell', 'work', 'call', 'try', 'ask', 'need', 'feel', 'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin', 'seem', 'help', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe', 'bring', 'happen', 'write', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain'],
    'Food & Dining': ['water', 'food', 'bread', 'apple', 'milk', 'meat', 'rice', 'chicken', 'coffee', 'tea', 'eat', 'drink', 'table', 'cook'],
    'Places & Objects': ['home', 'house', 'school', 'hospital', 'city', 'country', 'world', 'place', 'room', 'street', 'car', 'book', 'door', 'window', 'table', 'chair', 'bed', 'computer', 'phone'],
    'Emotions & Traits': ['happy', 'sad', 'angry', 'love', 'hate', 'fear', 'smile', 'cry', 'good', 'bad', 'great', 'small', 'big', 'large', 'high', 'low', 'old', 'young', 'new', 'beautiful', 'ugly', 'strong', 'weak', 'fast', 'slow', 'hard', 'soft']
};

function start() {
    const raw = fs.readFileSync('./src/assets/dictionary.json', 'utf8');
    const dictionary = JSON.parse(raw);

    for (const word in dictionary) {
        let assignedCategory = 'General Essential Vocabulary';

        for (const [catName, keywords] of Object.entries(categoriesMap)) {
            if (keywords.includes(word.toLowerCase())) {
                assignedCategory = catName;
                break;
            }
        }

        dictionary[word].category = assignedCategory;
    }

    fs.writeFileSync('./src/assets/dictionary_categorized.json', JSON.stringify(dictionary, null, 2));
    console.log('Finished categorizing dictionary into dictionary_categorized.json!');
}

start();
