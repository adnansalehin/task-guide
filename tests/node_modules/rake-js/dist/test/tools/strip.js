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
const strip_1 = require("../../lib/tools/strip");
let StripTest = class StripTest {
    removesNonAsciiCharacters() {
        const corpus = 'Hello +*# World';
        const result = strip_1.default(corpus);
        const expected = 'Hello World';
        chai_1.expect(result).to.be.equal(expected);
    }
    stripPunctuation() {
        chai_1.expect(strip_1.default('test.')).to.be.equal('test');
    }
    stripNoUmlauts() {
        chai_1.expect(strip_1.default('täst')).to.be.equal('täst');
    }
    stripBadWhitespace() {
        chai_1.expect(strip_1.default(' aa  \t \r \n \r\n bb ')).to.be.equal('aa bb');
    }
};
__decorate([
    mocha_typescript_1.test
], StripTest.prototype, "removesNonAsciiCharacters", null);
__decorate([
    mocha_typescript_1.test
], StripTest.prototype, "stripPunctuation", null);
__decorate([
    mocha_typescript_1.test
], StripTest.prototype, "stripNoUmlauts", null);
__decorate([
    mocha_typescript_1.test
], StripTest.prototype, "stripBadWhitespace", null);
StripTest = __decorate([
    mocha_typescript_1.suite(mocha_typescript_1.timeout(100), mocha_typescript_1.slow(10))
], StripTest);
//# sourceMappingURL=strip.js.map