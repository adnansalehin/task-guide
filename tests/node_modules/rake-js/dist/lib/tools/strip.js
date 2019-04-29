"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const condenseWhitespace = require("condense-whitespace");
function strip(text) {
    const txt = text
        .replace(/[^a-zäöüß']/gi, ' ')
        .replace(/(^|\s)+\w($|\s)+/g, ' ');
    return condenseWhitespace(txt);
}
exports.default = strip;
//# sourceMappingURL=strip.js.map