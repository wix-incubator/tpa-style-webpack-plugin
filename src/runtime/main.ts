import {CustomSyntaxHelper} from './CustomSyntaxHelper';
import {generateTPAParams} from './generateTPAParams';
import {processor} from './processor';
import {defaultCssPlugins} from './defaultCssFunctions';
import {Plugins} from './plugins';

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

const plugins = new Plugins();
Object.keys(defaultCssPlugins)
  .forEach((funcName) => plugins.addCssFunction(funcName, defaultCssPlugins[funcName]));

export interface IInjectedData {
  css: string;
  customSyntaxStrs: string[];
  cssVars: { [key: string]: string };
}

export interface IOptions {
  isRTL: boolean;
  prefixSelector: string;
}

const defaultOptions = {isRTL: false};

export function loader(loaderOptions) {
  return ({siteColors, siteTextPresets, styleParams}, options: Partial<IOptions>) => {
    options = {...defaultOptions, ...options};
    const injectedData: IInjectedData = '__INJECTED_DATA_PLACEHOLDER__' as any;
    const prefixedCss = injectedData.css.replace(new RegExp(loaderOptions.prefixSelector, 'g'), options.prefixSelector ? `${options.prefixSelector}` : '');

    const tpaParams = generateTPAParams(siteColors, siteTextPresets, styleParams, options);

    const customSyntaxHelper = new CustomSyntaxHelper();
    customSyntaxHelper.setVars(injectedData.cssVars);
    customSyntaxHelper.setCustomSyntax(injectedData.customSyntaxStrs);

    return customSyntaxHelper.customSyntaxStrs.reduce((processedContent, part) => {
      const newValue = processor({
        part, customSyntaxHelper, tpaParams, cacheMap: {}
      }, {plugins, shouldUseCssVars: false});

      return processedContent.replace(new RegExp(escapeRegExp(part), 'g'), newValue);
    }, prefixedCss);
  };
}
