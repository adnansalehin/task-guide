"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function load(language) {
    const list = require('../stopwords/' + language).default;
    return new Set(list);
}
exports.default = load;
//# sourceMappingURL=stoplist.js.map