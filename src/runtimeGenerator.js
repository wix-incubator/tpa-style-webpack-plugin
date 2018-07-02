const addStylesTemplate = require('./addStyles').toString();



module.exports =  function generateRuntime({css, filename, cssVars, customSyntaxStrs}) {
  const customStyles = generateCustomStyles(css, cssVars, customSyntaxStrs);
  return `(${addStylesTemplate})()`
    .replace('__CSS__', JSON.stringify(css))
    .replace('__ID__', filename);
};

function generateCustomStyles(css, cssVars, customSyntaxStrs) {
  console.log(css, cssVars, customSyntaxStrs);
}
