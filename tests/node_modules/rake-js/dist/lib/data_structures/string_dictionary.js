"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringDictionary {
    constructor() {
        this.dict = {};
    }
    add(key, value) {
        if (!key || !value) {
            return;
        }
        this.dict[key] = value;
    }
    get(key) {
        return this.dict[key];
    }
}
exports.default = StringDictionary;
//# sourceMappingURL=string_dictionary.js.map