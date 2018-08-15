import * as path from 'path';
import { clearDir } from './helpers/clear-dir';
import { runWebpack } from './helpers/run-webpack';
import { IGetProcessedCssFn } from '../src/runtime/main';
import { siteColors } from './fixtures/siteColors';
import { siteTextPresets } from './fixtures/siteTextPresets';
import { styleParams } from './fixtures/styleParams';
import { clonedWith } from './helpers/cloned-with';

describe.only('runtime', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime');
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
      }
    });

    const { getProcessedCss: realFunc } = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    getProcessedCss = realFunc;
  });

  it('should support colors from settings', () => {
    const newStyleParams = clonedWith(styleParams, { colors: { my_var: { value: 'red' } } });
    // const additionalStyle = `.foo3 {--my_var4: "string(0px)"; width: "string(--my_var4)";}`;
    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo {color: rgb(255, 0, 0);}';
    expect(css).toContain(expectedCss);
  });

  it('should support fonts from settings', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        my_var2: {
          value: `font-family:'mr de haviland','cursive';`,
          index: 93,
          cssFontFamily: `'mr de haviland','cursive'`,
          family: 'mr de haviland',
          fontParam: true,
          size: 0,
          style: {
            bold: false,
            italic: false,
            underline: false
          }
        }
      }
    });
    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo {font: normal normal normal 17px/1.4em mr de haviland,cursive;text-decoration: ;}';
    expect(css).toContain(expectedCss);
  });

  it('should support font string hack from settings', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        fonts: {
          my_var3: {
            value: '100px',
            fontStyleParam: false
          }
        }
      });
    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo {width: 100px;}';
    expect(css).toContain(expectedCss);
  });

  it('should support string default value', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        numbers: {},
        colors: {},
        fonts: {}
      });
    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo2 {--my_var4: 0px; width: 0px;}';
    expect(css).toContain(expectedCss);
  });

  it('should support default values', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        numbers: {},
        colors: {
          my_var5: { value: 'rgba(128,110,66,0.6193647540983607)' }
        },
        fonts: {}
      });
    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = ':root {--my_var3: #717070;}';
    const expectedCss2 = '.foo5 {color: rgba(128, 110, 66, 0.62);}';
    expect(css).toContain(expectedCss);
    expect(css).toContain(expectedCss2);
  });

  it('should work with declarations with no semicolon at the end', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        colors: {
          my_var2: { value: 'rgba(128,110,66,0.6193647540983607)' }
        }
      });
    const newSiteTextPresets = clonedWith(siteTextPresets,
      {
        'Body-M': {
          editorKey: 'font_8',
          fontFamily: 'raleway',
          lineHeight: '1.4em',
          size: '17px',
          style: 'normal',
          value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
          weight: 'normal'
        }
      });
    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets: newSiteTextPresets }, {});
    const expectedCss = ':root {--cart_textFontStyle:normal normal normal 17px/1.4em raleway,sans-serif; --cartButton_textColor:#FFFFFF;}';
    const expectedCss2 = '.foo6 {font:normal normal normal 17px/1.4em raleway,sans-serif;text-decoration: ; color:#FFFFFF;}';
    expect(css).toContain(expectedCss);
    expect(css).toContain(expectedCss2);
  });
});
