import {CustomSyntaxHelper} from './CustomSyntaxHelper';
import {generateTPAParams} from './generateTPAParams';
import {processor} from './processor';
import {defaultPlugins} from './defaultCssFunctions';
import {Plugins} from './plugins';

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

const plugins = new Plugins();
Object.keys(defaultPlugins)
  .forEach((funcName) => plugins.addCssFunction(funcName, defaultPlugins[funcName]));

export interface IInjectedData {
  css: string;
  customSyntaxStrs: string[];
  cssVars: { [key: string]: string };
}

export function getProcessedCss({siteColors, siteTextPresets, styleParams}) {
  const injectedData: IInjectedData = '__INJECTED_DATA_PLACEHOLDER__' as any;

  const tpaParams = generateTPAParams(siteColors, siteTextPresets, styleParams);

  const customSyntaxHelper = new CustomSyntaxHelper();
  customSyntaxHelper.setVars(injectedData.cssVars);
  customSyntaxHelper.setCustomSyntax(injectedData.customSyntaxStrs);

  return customSyntaxHelper.customSyntaxStrs.reduce((processedContent, part) => {
    const newValue = processor({
      part, customSyntaxHelper, tpaParams, cacheMap: {}
    }, {plugins, shouldUseCssVars: false});

    return processedContent.replace(new RegExp(escapeRegExp(part), 'g'), newValue);
  }, injectedData.css);
}
