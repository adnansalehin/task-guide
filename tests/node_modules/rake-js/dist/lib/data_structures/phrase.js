"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class Phrase {
    constructor() {
        this.words = [];
        this.stems = [];
        this.score = 0.0;
    }
    isEmpty() {
        return this.words.length === 0;
    }
    pushWord(word) {
        if (word && word.length > 1) {
            this.words.push(word);
        }
    }
    createText() {
        this.text = this.words.join(' ');
    }
    calculateStems(stemmer) {
        this.stems = lodash_1.map(this.words, word => stemmer.stem(word));
    }
    calculateScore(stemIndex) {
        let sum = 0.0;
        for (const stem of this.stems) {
            sum += stemIndex[stem];
        }
        this.score = sum;
    }
    multiplyWith(amount) {
        this.score *= amount;
    }
}
exports.default = Phrase;
//# sourceMappingURL=phrase.js.map