"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const phrase_1 = require("../data_structures/phrase");
const strip_1 = require("./strip");
class Parser {
    constructor(stemmer, stopwords) {
        this.stemmer = stemmer;
        this.stopwords = stopwords;
        this.phrases = [];
        this.setNewPhraseCache();
    }
    process(wordArray) {
        for (const phrase of wordArray) {
            this.push(phrase.toLowerCase());
        }
        this.stemAll();
        return this;
    }
    joinDuplicates() {
        const groups = lodash_1.groupBy(this.phrases, 'text');
        const resultList = [];
        for (const text in groups) {
            if (text) {
                const group = groups[text];
                const amount = group.length;
                group[0].multiplyWith(amount);
                resultList.push(group[0]);
            }
        }
        this.phrases = resultList;
    }
    bestPhrases() {
        const phrases = lodash_1.sortBy(this.phrases, ['score', 'text']).reverse();
        const optimalAmount = Math.ceil(this.phrases.length / 3.0);
        return lodash_1.map(lodash_1.take(phrases, optimalAmount), 'text');
    }
    push(phrase) {
        for (const word of phrase.split(/\s+/)) {
            const strippedWord = strip_1.default(word);
            const hasPunctuation = strippedWord !== word;
            const isStopWord = this.stopwords.has(word);
            if (isStopWord || word.length < 2) {
                this.finalizePhraseCache();
            }
            else if (hasPunctuation) {
                this.cache.pushWord(strippedWord);
                this.finalizePhraseCache();
            }
            else {
                this.cache.pushWord(strippedWord);
            }
        }
    }
    setNewPhraseCache() {
        this.cache = new phrase_1.default();
    }
    finalizePhraseCache() {
        if (!this.cache.isEmpty()) {
            this.cache.createText();
            this.phrases.push(this.cache);
            this.setNewPhraseCache();
        }
    }
    stemAll() {
        for (const phrase of this.phrases) {
            phrase.calculateStems(this.stemmer);
        }
    }
}
exports.default = Parser;
//# sourceMappingURL=parser.js.map