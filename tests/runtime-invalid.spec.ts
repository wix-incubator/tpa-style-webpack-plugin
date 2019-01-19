import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {siteColors} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';
import {clonedWith} from './helpers/cloned-with';

describe('runtime invalid input', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime-invalid-input');
  const entryName = 'app';
  let getProcessedCss: IGetProcessedCssFn;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs',
      },
      entry: {
        [entryName]: './tests/fixtures/runtime-invalid-input-entry.ts',
      },
    });

    const {getProcessedCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    getProcessedCss = realFunc;
  });

  it('should throw on unbalanced parenthesis', () => {
    expect(() => getProcessedCss({styleParams, siteColors, siteTextPresets}, {})).toThrowError(
      /contains unbalanced parenthesis/
    );
  });

  it('should not throw when not in strict mode', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {
        varWithInvalidColor: {
          themeName: '',
          value: '(){}',
        },
      },
      fonts: {},
    });
    expect(() =>
      getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {strictMode: false})
    ).not.toThrowError();

    expect(getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {strictMode: false}))
      .toEqual(` .invalid-styles {
  color: ;
  color: ;
  color: ;
  font: ;
  color: #FFFFFF;
}`);
  });
});
