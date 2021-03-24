import {IOptions, IInjectedData, IStyles, IDefaults} from './types';
import {getProcessedCssWithConfig, getStaticCssWithConfig} from './standalone';
export type IGetProcessedCssFn = typeof getProcessedCss;
export type IGetStaticCssFn = typeof getStaticCss;

export function getProcessedCss(styles: IStyles, options?: Partial<IOptions>, defaults?: IDefaults): string {
  const injectedData = '__COMPILATION_HASH__INJECTED_DATA_PLACEHOLDER' as any;

  const processedCssConfig = {
    defaults,
    ...injectedData,
    compilationHash: '__COMPILATION_HASH__',
  };

  return getProcessedCssWithConfig(processedCssConfig, styles, options);
}

export function getStaticCss(options?: Pick<IOptions, 'prefixSelector'>) {
  const injectedData: IInjectedData = '__COMPILATION_HASH__INJECTED_STATIC_DATA_PLACEHOLDER' as any;

  const cssConfig = {
    ...injectedData,
    compilationHash: '__COMPILATION_HASH__',
  };

  return getStaticCssWithConfig(cssConfig, options);
}
