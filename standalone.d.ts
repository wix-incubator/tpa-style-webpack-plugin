import {IOptions, IStyles} from './dist/runtime/types';
import {CssConfig as ICssConfig} from './dist/runtime/standalone';

export type CssConfig = ICssConfig;

export declare function getProcessedCssWithConfig(
  processedCssConfig: CssConfig,
  {siteColors, siteTextPresets, styleParams}: IStyles,
  options?: Partial<IOptions>
): string;

export declare function getStaticCssWithConfig(
  staticCssConfig: CssConfig,
  {
    prefixSelector,
  }?: {
    prefixSelector: string;
  }
): string;
