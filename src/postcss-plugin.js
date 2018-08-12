const postcss = require('postcss');

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

      if (isCssVar(decl.prop)) {
        cssVars[decl.prop] = decl.value;
      }
      if (match = decl.value.match(customSyntaxRegex)) {
        customSyntaxStrs.push(...match);
      }
    });

    if (typeof opts.onFinish === 'function') {
      opts.onFinish({cssVars, customSyntaxStrs});
    }
  };
});

