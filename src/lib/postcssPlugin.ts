import postcss from 'postcss';
import {Declaration, ContainerBase} from 'postcss';
import * as replacers from './replacers';

function isCssVar(key: string) {
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

function collectCustomSyntaxFrom(value: string, customSyntaxStrs: string[]): void {
  let match;
  if ((match = value.match(customSyntaxRegex))) {
    customSyntaxStrs.push(...match);
  }
}

export const extractTPACustomSyntax = postcss.plugin('postcss-wix-tpa-style', (opts: IOptions = {} as IOptions) => {
  const cssVars = {};
  const customSyntaxStrs: string[] = [];

  return (css: ContainerBase) => {
    css.walkDecls((decl: Declaration) => {
      const replacersNames = (Object.keys(replacers) as unknown) as (keyof typeof replacers)[];

      replacersNames.forEach(replacerName => (decl = replacers[replacerName](decl)));

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
  };
});
