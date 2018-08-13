"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const replacers_1 = require("./replacers");
const postcss = require("postcss");
function isCssVar(key) {
    return key.indexOf('--') === 0;
}
const customSyntaxRegex = /"\w+\([^"]*\)"/g;
module.exports = postcss.plugin('postcss-wix-tpa-style', (opts = {}) => {
    const cssVars = {};
    const customSyntaxStrs = [];
    return (css) => {
        css.walkDecls((decl) => {
            let match;
            decl = replacers_1.directionReplacer(decl);
            if (isCssVar(decl.prop)) {
                cssVars[decl.prop] = decl.value;
            }
            if (match = decl.prop.match(customSyntaxRegex)) {
                customSyntaxStrs.push(...match);
            }
            if (match = decl.value.match(customSyntaxRegex)) {
                customSyntaxStrs.push(...match);
            }
        });
        if (typeof opts.onFinish === 'function') {
            opts.onFinish({ cssVars, customSyntaxStrs, css: css.toString() });
        }
    };
});
