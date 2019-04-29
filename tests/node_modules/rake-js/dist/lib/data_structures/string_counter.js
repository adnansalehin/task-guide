"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringCounter {
    constructor() {
        this.counter = {};
    }
    count(str) {
        if (!str) {
            return;
        }
        if (this.counter[str]) {
            this.counter[str]++;
        }
        else {
            this.counter[str] = 1;
        }
    }
    strings() {
        return Object.keys(this.counter);
    }
}
exports.default = StringCounter;
//# sourceMappingURL=string_counter.js.map