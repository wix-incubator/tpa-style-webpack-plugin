import {generateTPAParams} from './generateTPAParams';
import {getProcessor} from './processor';
import {cssFunctions} from './cssFunctions';
import {Plugins} from './plugins';
import {IInjectedData, IStyles} from './types';

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

const plugins = new Plugins();
Object.keys(cssFunctions).forEach(funcName => plugins.addCssFunction(funcName, cssFunctions[funcName]));

export interface IOptions {
  isRTL: boolean;
  prefixSelector: string;
  strictMode: boolean;
}

export type IGetProcessedCssFn = typeof getProcessedCss;
export type IGetProcessedCssWithConfigFn = typeof getProcessedCssWithConfig;
export type IGetStaticCssFn = typeof getStaticCss;
export type IGetStaticCssWithConfigFn = typeof getStaticCssWithConfig;

export interface CssConfig {
  cssVars: {[key: string]: string};
  customSyntaxStrs: string[];
  css: string;
  staticCss: string;
  compilationHash: string;
}

const defaultOptions = {
  isRTL: false,
  strictMode: true,
};

export function getProcessedCss(styles: IStyles, options?: Partial<IOptions>): string {
  const injectedData = '__COMPILATION_HASH__INJECTED_DATA_PLACEHOLDER' as any;

  const processedCssConfig = {
    ...injectedData,
    compilationHash: '__COMPILATION_HASH__',
  };

  return getProcessedCssWithConfig(processedCssConfig, styles, options);
}

export function getProcessedCssWithConfig(
  processedCssConfig: CssConfig,
  {siteColors, siteTextPresets, styleParams}: IStyles,
  options?: Partial<IOptions>
): string {
  options = {...defaultOptions, ...(options || {})};

  if (!processedCssConfig.css) {
    return '';
  }

  const prefixedCss = processedCssConfig.css.replace(
    new RegExp(processedCssConfig.compilationHash, 'g'),
    options.prefixSelector ? `${options.prefixSelector}` : ''
  );

  const tpaParams = generateTPAParams(siteColors, siteTextPresets, styleParams, options);

  const processor = getProcessor({cssVars: processedCssConfig.cssVars, plugins});

  return processedCssConfig.customSyntaxStrs.reduce((processedContent, part) => {
    let newValue;
    try {
      newValue = processor.process({part, tpaParams});
    } catch (e) {
      if (options.strictMode) {
        throw e;
      } else {
        newValue = '';
      }
    }
    return processedContent.replace(new RegExp(escapeRegExp(part), 'g'), newValue);
  }, prefixedCss);
}

export function getStaticCssWithConfig(staticCssConfig: CssConfig, {prefixSelector} = {prefixSelector: ''}) {
  const prefixedCss = (staticCssConfig.staticCss || '').replace(
    new RegExp(staticCssConfig.compilationHash, 'g'),
    prefixSelector
  );
  return prefixedCss;
}

export function getStaticCss(options?: Pick<IOptions, 'prefixSelector'>) {
  const injectedData: IInjectedData = '__COMPILATION_HASH__INJECTED_STATIC_DATA_PLACEHOLDER' as any;

  const cssConfig = {
    ...injectedData,
    compilationHash: '__COMPILATION_HASH__',
  };

  return getStaticCssWithConfig(cssConfig, options);
}
