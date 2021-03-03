import path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {readFile} from './helpers/readfile';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';

describe('multiple-entries', () => {
  const outputDirPath = path.resolve(__dirname, './output/multiple-entries');
  const entryName1 = 'app1';
  const entryName2 = 'app2';
  let cssFile1: string,
    tpaRuntime1: {getProcessedCss: IGetProcessedCssFn},
    cssFile2: string,
    tpaRuntime2: {getProcessedCss: IGetProcessedCssFn};

  beforeAll(async () => {
    await clearDir(outputDirPath);
    await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs',
      },
      entry: {
        [entryName1]: './tests/fixtures/first-entry.ts',
        [entryName2]: './tests/fixtures/second-entry.ts',
      },
    });

    cssFile1 = await readFile(path.join(outputDirPath, `${entryName1}.styles.css`), 'utf8');
    cssFile2 = await readFile(path.join(outputDirPath, `${entryName2}.styles.css`), 'utf8');
    tpaRuntime1 = require(path.join(outputDirPath, `${entryName1}.bundle.js`));
    tpaRuntime2 = require(path.join(outputDirPath, `${entryName2}.bundle.js`));
  });

  it('should generate 2 css files without tpa styles', () => {
    [cssFile1, cssFile2].forEach(file => {
      expect(file).not.toContain('.only-tpa');
      expect(file).not.toContain('START');
      expect(file).not.toContain('END');
      expect(file).not.toContain('DIR');
    });
  });

  it('cssFile1 should have body while cssFile2 not', () => {
    expect(tpaRuntime1.getProcessedCss({styleParams, siteTextPresets, siteColors})).toContain('body {');
    expect(tpaRuntime2.getProcessedCss({styleParams, siteTextPresets, siteColors})).not.toContain('body {');
  });

  it('should not leak variables from different entries', () => {
    expect(tpaRuntime1.getProcessedCss({styleParams, siteTextPresets, siteColors})).not.toContain('--first_none_falsy');
    expect(tpaRuntime1.getProcessedCss({styleParams, siteTextPresets, siteColors})).toContain(
      '.first-none-falsy2 {color: }'
    );
    expect(tpaRuntime2.getProcessedCss({styleParams, siteTextPresets, siteColors})).toContain(
      '--first_none_falsy: rgb(255, 0, 0)'
    );
  });
});
