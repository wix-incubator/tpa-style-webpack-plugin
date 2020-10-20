import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {
  IGetProcessedCssFn,
  IGetProcessedCssWithConfigFn,
  IGetStaticCssFn,
  IGetStaticCssWithConfigFn,
  CssConfig,
} from '../src/runtime/main';
import {siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';

describe('runtime standalone', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime-standalone');
  const entryName = 'app';
  let getProcessedCss: IGetProcessedCssFn,
    getStaticCss: IGetStaticCssFn,
    getProcessedCssWithConfig: IGetProcessedCssWithConfigFn,
    getStaticCssWithConfig: IGetStaticCssWithConfigFn,
    cssConfig: CssConfig;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs',
      },
      entry: {
        [entryName]: './tests/fixtures/runtime-entry.ts',
      },
    });

    const runtime = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    const config = require(path.join(outputDirPath, `${entryName}.bundle.cssConfig.js`));
    cssConfig = config.cssConfig;

    getProcessedCss = runtime.getProcessedCss;
    getStaticCss = runtime.getStaticCss;
    getStaticCssWithConfig = runtime.getStaticCssWithConfig;
    getProcessedCssWithConfig = runtime.getProcessedCssWithConfig;
  });

  it('should generate identical dynamic css as injected config', () => {
    const injectedCss = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const standaloneCss = getProcessedCssWithConfig(cssConfig, {styleParams, siteColors, siteTextPresets}, {});
    expect(injectedCss).toContain(standaloneCss);
  });

  it('should generate identical static css as injected config', () => {
    const injectedCss = getStaticCss();
    const standaloneCss = getStaticCssWithConfig(cssConfig);
    expect(injectedCss).toContain(standaloneCss);
  });
});
