"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
module.exports = function () {
};
module.exports.pitch = function () {
    this.cacheable && this.cacheable();
    const callback = this.async();
    const templatePath = path.join(__dirname, './runtime/main.js');
    this.addDependency(templatePath);
    callback(null, `export * from '${templatePath}'`);
};
