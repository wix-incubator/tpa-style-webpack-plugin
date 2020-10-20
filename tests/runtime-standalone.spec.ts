import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {IGetProcessedCssFn, IGetProcessedCssWithConfigFn, ProcessedCssConfig} from '../src/runtime/main';
import {siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';

describe('runtime standalone', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime-standalone');
  const entryName = 'app';
  let getProcessedCss: IGetProcessedCssFn,
    getProcessedCssWithConfig: IGetProcessedCssWithConfigFn,
    processedCssConfig: ProcessedCssConfig;

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
    processedCssConfig = require(path.join(outputDirPath, `${entryName}.bundle.processedCssConfig.js`));
    getProcessedCss = runtime.getProcessedCss;
    getProcessedCssWithConfig = runtime.getProcessedCssWithConfig;
  });

  it('should generate identical css as injected config', () => {
    const injectedCss = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const standaloneCss = getProcessedCssWithConfig(processedCssConfig, {styleParams, siteColors, siteTextPresets}, {});
    expect(injectedCss).toContain(standaloneCss);
  });
});
