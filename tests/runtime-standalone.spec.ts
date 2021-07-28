import path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {IGetProcessedCssFn, IGetStaticCssFn} from '../src/runtime/main';
import {
  getProcessedCssWithConfig,
  getStaticCssWithConfig,
  CssConfig,
  getBuildTimeStaticCss,
} from '../src/runtime/standalone';
import {siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';
import {createHash} from 'crypto';

describe('runtime standalone', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime-standalone');
  const entryName = 'app';
  let getProcessedCss: IGetProcessedCssFn, getStaticCss: IGetStaticCssFn, cssConfig: CssConfig;

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
    const config = require(path.join(outputDirPath, `${entryName}.cssConfig.bundle.js`));
    cssConfig = config.cssConfig;

    getProcessedCss = runtime.getProcessedCss;
    getStaticCss = runtime.getStaticCss;
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

  it('should generate identical static-css and build-time css', () => {
    const standaloneCss = getStaticCssWithConfig(cssConfig, {prefixSelector: ''});
    const buildTimeCss = getBuildTimeStaticCss(cssConfig);
    expect(buildTimeCss.css).toEqual(standaloneCss);
  });

  it('should generate proper build-time css hash (identical to cssConfig.staticCss)', () => {
    const buildtimeStaticCss = createHash('sha1')
      .update(cssConfig.staticCss)
      .digest('base64');
    const buildTimeCss = getBuildTimeStaticCss(cssConfig);
    expect(buildTimeCss.hash).toEqual(buildtimeStaticCss);
  });
});
