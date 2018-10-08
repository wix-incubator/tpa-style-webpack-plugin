import * as path from 'path';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {styleParams} from './fixtures/styleParams';
import {siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {runWebpack} from './helpers/run-webpack';
import {clearDir} from './helpers/clear-dir';

describe('Eval source maps', () => {
  const outputDirPath = path.resolve(__dirname, './output/eval-source-maps');
  const entryName = 'app';
  let getProcessedCss: IGetProcessedCssFn;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs'
      },
      devtool: 'cheap-eval-source-map',
      entry: {
        [entryName]: './tests/fixtures/runtime-entry.js'
      }
    });
  });

  it('should support string eval', () => {
    try {
      const {getProcessedCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
      getProcessedCss = realFunc;
      expect(() => getProcessedCss({styleParams, siteColors, siteTextPresets})).not.toThrow();
    } catch (e) {
      throw new Error('it should be parsed correctly');
    }
  });
});
