import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {getSiteColor, siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';
import {AddAssetsPlugin} from './helpers/AddAssetsPlugin';
import {readFile} from './helpers/readfile';

describe('additional assets (stylable int)', () => {
  const outputDirPath = path.resolve(__dirname, './output/additional-assets');
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
        [entryName]: './tests/fixtures/runtime-entry.js'
      },
      plugins: [
        new AddAssetsPlugin({
          filename: 'additional-style.css',
          src: `
          .index--root { background-color: "color(color-19)"; }`
        })
      ]
    });

    const {getProcessedCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    getProcessedCss = realFunc;
  });

  it('should contain all the css assets that are belong to the same chunk', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    expect(css).toContain(`.index--root { background-color: ${getSiteColor('color-19', siteColors)}; }`);
  });

  it('should extract from the additional asset', async() => {
    const cssFile = await readFile(path.join(outputDirPath, `additional-style.css`), 'utf8');
    expect(cssFile).not.toContain(`.index--root`);
  });
});
