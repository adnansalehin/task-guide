"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const word_matrix_1 = require("./data_structures/word_matrix");
const parser_1 = require("./tools/parser");
const preprocessor_1 = require("./tools/preprocessor");
const stemmer_1 = require("./tools/stemmer");
const stoplist_1 = require("./tools/stoplist");
function rake(params) {
    const preprocessor = new preprocessor_1.default(params.delimiters);
    const wordArray = preprocessor.process(params.corpus);
    const stemmer = new stemmer_1.default(params.language);
    const stopwords = stoplist_1.default(params.language);
    const parser = new parser_1.default(stemmer, stopwords).process(wordArray);
    const stemList = stemmer.getStems();
    const matrix = new word_matrix_1.default(stemList);
    for (const phrase of parser.phrases) {
        matrix.process(phrase.stems);
    }
    const stemScores = matrix.calculateScores();
    for (const phrase of parser.phrases) {
        phrase.calculateScore(stemScores);
    }
    parser.joinDuplicates();
    return parser.bestPhrases();
}
exports.rake = rake;
//# sourceMappingURL=rake.js.map