import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {siteColors, getSiteColor} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';
import {clonedWith} from './helpers/cloned-with';

describe('runtime unbalanced parenthesis', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime-unbalanced-parenthesis');
  const entryName = 'app';
  let getProcessedCss: IGetProcessedCssFn;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs'
      },
      entry: {
        [entryName]: './tests/fixtures/runtime-unbalanced-parenthesis-entry.js'
      }
    });

    const {getProcessedCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    getProcessedCss = realFunc;
  });

  it('should throw on unbalanced parenthesis', () => {
    expect(() => getProcessedCss({styleParams, siteColors, siteTextPresets}, {})).toThrowError(/contains unbalanced parenthesis/);
  });
});
