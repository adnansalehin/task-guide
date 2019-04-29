"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const rake_1 = require("./rake");
const guess_language_1 = require("./tools/guess_language");
const defaults = {
    delimiters: ['\\s+'],
    language: 'english',
};
function process(text, opts) {
    const options = lodash_1.merge({}, defaults, opts);
    if (!opts || !opts.language) {
        options.language = guess_language_1.default(text);
    }
    const params = lodash_1.merge(options, { corpus: text });
    const keywords = rake_1.rake(params);
    return keywords;
}
exports.default = process;
//# sourceMappingURL=index.js.map