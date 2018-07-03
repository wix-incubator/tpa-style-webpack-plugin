const generateRuntime = require('../src/runtimeGenerator');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const extractTPACustomSyntax = require('../src/postcss-plugin');

const css = fs.readFileSync(path.resolve(__dirname,'./fixtures/runtime-styles.css'), 'utf8');

describe.only('runtime', () => {
  let cssVars, customSyntaxStrs, runtimeCode;
  beforeAll(async () => {
    await postcss([extractTPACustomSyntax({
      onFinish(params) {
        cssVars = params.cssVars;
        customSyntaxStrs = params.customSyntaxStrs;
      }
    })])
      .process(css, {from: undefined, to: undefined})
  });

  beforeEach(() => {
    runtimeCode = generateRuntime({
      css,
      cssVars,
      customSyntaxStrs,
      filename: 'file-name.css'
    });
    eval(runtimeCode);
  });

  it.only('should append style tag', () => {
    console.log(document.querySelector('style').innerHTML);
  });
});
