import * as path from 'path';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {styleParams} from './fixtures/styleParams';
import {siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {runWebpack} from './helpers/run-webpack';
import {clearDir} from './helpers/clear-dir';
import {readFile} from './helpers/readfile';

describe('Extract Styles', () => {
  const outputDirPath = path.resolve(__dirname, './output/extract-styles');
  const entryName = 'app';
  let stats, cssFile, getProcessedCss: IGetProcessedCssFn;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    stats = await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs',
      },
      entry: {
        [entryName]: './tests/fixtures/runtime-entry.ts',
      },
    });

    cssFile = await readFile(path.join(outputDirPath, `${entryName}.styles.css`), 'utf8');
    const {getProcessedCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    getProcessedCss = realFunc;
  });

  it('should extract out TPA styles from regular css', () => {
    expect(cssFile).toMatchSnapshot('static-css');
  });

  it('should should not have a compilation hash', () => {
    expect(cssFile).not.toContain(/__.+__\s/g);
  });

  it('should contain only TPA styles', () => {
    expect(getProcessedCss({styleParams, siteColors, siteTextPresets})).toMatchSnapshot('dynamic-css');
  });

  it('should separate the static and dynamic parts of declarations', () => {
    expect(cssFile).toContain('.no-space-after-colon {rule: bar;rule3:baz}');
    expect(getProcessedCss({styleParams, siteTextPresets, siteColors})).toContain(
      '.no-space-after-colon {rule4: #FF0000;rule5: #FF0000}'
    );
  });

  it('should not have static CSS in Bundle file', () => {
    expect(cssFile).toContain('.not-modify-static-params');
    expect(getProcessedCss({styleParams, siteTextPresets, siteColors})).not.toContain('.not-modify-static-params');
  });
});
