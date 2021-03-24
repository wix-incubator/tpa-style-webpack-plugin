import path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {siteColors, getSiteColor} from './fixtures/siteColors';
import {stylesKeyDefinitions} from './fixtures/styleKeyDefinitions';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';
import {clonedWith} from './helpers/cloned-with';
import {readFile} from './helpers/readfile';
import {TinyColor} from '@ctrl/tinycolor';

describe('runtime with defaults', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime-with-defaults');
  const entryName = 'app';
  let getProcessedCss: IGetProcessedCssFn, runtimeBundleStr: string;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs',
      },
      entry: {
        [entryName]: './tests/fixtures/runtime-entry-defaults.ts',
      },
    });

    const {getProcessedCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    runtimeBundleStr = await readFile(path.join(outputDirPath, `${entryName}.bundle.js`), 'utf8');
    getProcessedCss = realFunc;
  });

  it('should support defaults for numbers', () => {
    const newStyleParams = clonedWith(styleParams, {});
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {}, stylesKeyDefinitions);
    const expectedCss = '.defaults-number {width: 10;}';
    expect(css).toContain(expectedCss);
  });

  it('should support defaults for numbers with a fallback', () => {
    const newStyleParams = clonedWith(styleParams, {});
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {}, stylesKeyDefinitions);
    const expectedCss = '.defaults-fallback-number {width: 10;}';
    expect(css).toContain(expectedCss);
  });

  it('should support defaults for colors', () => {
    const newStyleParams = clonedWith(styleParams, {});
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {}, stylesKeyDefinitions);
    const expectedCss = '.defaults-color {color: rgb(170, 168, 168);}';
    expect(css).toContain(expectedCss);
  });

  it('should support defaults for fonts', () => {
    const newStyleParams = clonedWith(styleParams, {});
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {}, stylesKeyDefinitions);
    const expectedCss = '.defaults-font {font: italic normal bold 20px/1.4em raleway;text-decoration: ;}';
    expect(css).toContain(expectedCss);
  });
});
