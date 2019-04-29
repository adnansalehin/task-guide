"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_typescript_1 = require("mocha-typescript");
const guess_language_1 = require("../../lib/tools/guess_language");
let GuessLanguage = class GuessLanguage {
    guessesEnglish() {
        const result = guess_language_1.default('Hello World');
        const expected = 'english';
        chai_1.expect(result).be.equal(expected);
    }
};
__decorate([
    mocha_typescript_1.test
], GuessLanguage.prototype, "guessesEnglish", null);
GuessLanguage = __decorate([
    mocha_typescript_1.suite(mocha_typescript_1.timeout(3000), mocha_typescript_1.slow(1000))
], GuessLanguage);
//# sourceMappingURL=guess_language.js.map