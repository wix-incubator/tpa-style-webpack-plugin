import {IExtractedResult, IParsedResult} from '../runtime/types';
import {Plugins} from '../runtime/plugins';
import {cssFunctions} from '../runtime/cssFunctions';

const plugins = new Plugins();
Object.keys(cssFunctions).forEach(funcName => plugins.addCssFunction(funcName, cssFunctions[funcName]));

export function parseCustomSyntax(results: IExtractedResult[]): IParsedResult[] {
  return results.map(({chunk, cssVars, customSyntaxStrs, css}) => {
    const parsedCustomSyntx = customSyntaxStrs.map((str) => {
      if(plugins.isSupportedFunction(str)) {

      }
    });
    return {
      chunk,
      css,
      cssVars: null,
      customSyntax: null,
    };
  });
}
