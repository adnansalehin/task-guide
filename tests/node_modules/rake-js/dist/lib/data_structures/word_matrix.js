"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WordMatrix {
    constructor(keys) {
        this.keys = keys;
        this.scores = {};
        this.index = {};
        this.size = keys.length;
        this.createIndex();
        this.createZeroMatrix();
    }
    incField(row, col) {
        this.matrix[row][col] += 1;
    }
    getRow(row) {
        return this.matrix[row];
    }
    process(values) {
        const indexes = values.map(key => this.index[key]);
        for (const row of indexes) {
            for (const col of indexes) {
                this.matrix[row][col] += 1;
            }
        }
    }
    calculateScores() {
        for (const key of this.keys) {
            const row = this.getRow(this.index[key]);
            let deg = 0.0;
            let freq = 0.0;
            for (const col of row) {
                if (col !== 0) {
                    deg += col;
                    freq += 1;
                }
            }
            this.scores[key] = deg / freq;
        }
        return this.scores;
    }
    createIndex() {
        const index = {};
        this.keys.forEach((key, i) => (index[key] = i));
        this.index = index;
    }
    createZeroMatrix() {
        const matrix = [];
        for (let i = 0; i < this.size; i++) {
            matrix.push(Array(this.size).fill(0));
        }
        this.matrix = matrix;
    }
}
exports.default = WordMatrix;
//# sourceMappingURL=word_matrix.js.map