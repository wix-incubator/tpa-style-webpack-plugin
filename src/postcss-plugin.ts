import * as replacers from './replacers';
import * as postcss from 'postcss';
import {Declaration, ContainerBase} from 'postcss';

function isCssVar(key) {
  return key.indexOf('--') === 0;
}

const customSyntaxRegex = /"\w+\([^"]*\)"/g;

export interface IOptions {
  onFinish: (result: IOptionResult) => void;
}

export interface IOptionResult {
  cssVars: { [key: string]: string };
  customSyntaxStrs: string[];
  css: string;
}

module.exports = postcss.plugin('postcss-wix-tpa-style', (opts: IOptions = {} as IOptions) => {
  const cssVars = {};
  const customSyntaxStrs = [];

  return (css: ContainerBase) => {
    css.walkDecls((decl: Declaration) => {
      let match;

      Object.keys(replacers)
        .forEach(replacerName => decl = replacers[replacerName](decl));

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
      opts.onFinish({cssVars, customSyntaxStrs, css: css.toString()});
    }
  };
});

