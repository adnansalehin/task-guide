"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class Preprocessor {
    constructor(delimiters) {
        this.delimiters = delimiters;
        this.buildDelimiterRegexp();
    }
    process(corpus) {
        return corpus.replace(/\\[nrt]/g, '. ').split(this.splitter).filter(Boolean);
    }
    buildDelimiterRegexp() {
        const patterns = lodash_1.map(this.delimiters, d => '(' + d + ')');
        const expression = '[' + patterns.join('') + ']';
        this.splitter = new RegExp(expression, 'g');
    }
}
exports.default = Preprocessor;
//# sourceMappingURL=preprocessor.js.map