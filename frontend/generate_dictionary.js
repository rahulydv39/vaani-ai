import fs from 'fs';
import https from 'https';

const WORDS_URL = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears.txt';

async function fetchWords() {
    return new Promise((resolve, reject) => {
        https.get(WORDS_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const words = data.split('\n').filter(w => w.length > 2).slice(0, 2100);
                resolve(words);
            });
        }).on('error', reject);
    });
}

async function translateWord(word) {
    return new Promise((resolve) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(word)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const hindi = parsed[0][0][0];
                    resolve({
                        word,
                        pos: 'word',
                        meaning: `Default English meaning for ${word}`,
                        hindi: hindi || 'अनुवाद उपलब्ध नहीं',
                        example: `I encountered the word '${word}'.`
                    });
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => {
            resolve(null);
        });
    });
}

async function start() {
    console.log('Fetching top words...');
    const words = await fetchWords();
    console.log(`Fetched ${words.length} words. Starting translation...`);

    const dictionaryData = {};

    // Batch processing
    const batchSize = 100;
    for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(words.length / batchSize)}...`);

        const results = await Promise.all(batch.map(w => translateWord(w)));

        for (const res of results) {
            if (res) {
                dictionaryData[res.word.toLowerCase()] = res;
            }
        }
        // Small delay to prevent rate limit
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Finished translating. Total words grabbed: ${Object.keys(dictionaryData).length}`);
    fs.writeFileSync('./src/assets/dictionary.json', JSON.stringify(dictionaryData, null, 2));
    console.log('Saved to src/assets/dictionary.json');
}

start();
