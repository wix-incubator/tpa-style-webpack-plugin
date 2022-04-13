import * as replacers from './replacers';
import {Declaration, Plugin} from 'postcss';

function isCssVar(key) {
  return key.indexOf('--') === 0;
}

const customSyntaxRegex = /"\w+\([^"]*\)"/g;

export interface IOptions {
  onFinish(result: IOptionResult): void;
}

export interface IOptionResult {
  cssVars: {[key: string]: string};
  customSyntaxStrs: string[];
  css: string;
}

function collectCustomSyntaxFrom(value: string, customSyntaxStrs): void {
  let match;
  if ((match = value.match(customSyntaxRegex))) {
    customSyntaxStrs.push(...match);
  }
}

export const extractTPACustomSyntax = (opts: IOptions = {} as IOptions): Plugin => {
  const cssVars = {};
  const customSyntaxStrs = [];

  return {
    postcssPlugin: 'postcss-wix-tpa-style',
    Once: css => {
      css.walkDecls((decl: Declaration) => {
        Object.keys(replacers).forEach(replacerName => (decl = replacers[replacerName](decl)));

        if (isCssVar(decl.prop)) {
          cssVars[decl.prop] = decl.value;
        }

        collectCustomSyntaxFrom(decl.prop, customSyntaxStrs);
        collectCustomSyntaxFrom(decl.value, customSyntaxStrs);
      });

      if (typeof opts.onFinish === 'function') {
        const uniqueCustomSyntaxStrs = customSyntaxStrs.filter((value, index, self) => self.indexOf(value) === index);

        opts.onFinish({cssVars, customSyntaxStrs: uniqueCustomSyntaxStrs, css: css.toString()});
      }
    },
  };
};
