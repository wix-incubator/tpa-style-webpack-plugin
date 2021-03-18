import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {readFile} from './helpers/readfile';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';

describe('customized-chunk-patterns', () => {
  const outputDirPath = path.resolve(__dirname, './output/customized-chunk-patterns');
  const entryName1 = 'app1';
  const entryName2 = 'app2';
  let cssFile1,
    tpaRuntime1: {getProcessedCss: IGetProcessedCssFn},
    cssFile2,
    tpaRuntime2: {getProcessedCss: IGetProcessedCssFn};

  beforeAll(async () => {
    await clearDir(outputDirPath);
    await runWebpack(
      {
        output: {
          path: path.resolve(outputDirPath),
          libraryTarget: 'commonjs',
        },
        entry: {
          [entryName1]: './tests/fixtures/first-entry.ts',
          [entryName2]: './tests/fixtures/first-entry.ts',
        },
      },
      {
        jsChunkPattern: new RegExp(`${entryName1}\\.bundle\\.js$`),
        cssChunkPattern: new RegExp(`${entryName1}\\.styles\\.css$`),
      }
    );

    cssFile1 = await readFile(path.join(outputDirPath, `${entryName1}.styles.css`), 'utf8');
    cssFile2 = await readFile(path.join(outputDirPath, `${entryName2}.styles.css`), 'utf8');
    tpaRuntime1 = require(path.join(outputDirPath, `${entryName1}.bundle.js`));
    tpaRuntime2 = require(path.join(outputDirPath, `${entryName2}.bundle.js`));
  });

  it('should generate only matched css chunk without tpa styles', () => {
    expect(cssFile1).not.toContain('.only-tpa');
    expect(cssFile1).not.toContain('START');
    expect(cssFile1).not.toContain('END');
    expect(cssFile1).not.toContain('DIR');

    expect(cssFile2).toContain('.only-tpa');
    expect(cssFile2).toContain('START');
    expect(cssFile2).toContain('END');
    expect(cssFile2).toContain('DIR');
  });

  it('matched chunk should have body while other one - not', () => {
    expect(tpaRuntime1.getProcessedCss({styleParams, siteTextPresets, siteColors})).toContain('body {');
    expect(tpaRuntime2.getProcessedCss({styleParams, siteTextPresets, siteColors})).not.toContain('body {');
  });
});
