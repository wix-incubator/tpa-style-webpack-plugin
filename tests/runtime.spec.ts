import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {IGetProcessedCssFn} from '../src/runtime/main';
import {siteColors, getSiteColor} from './fixtures/siteColors';
import {siteTextPresets} from './fixtures/siteTextPresets';
import {styleParams} from './fixtures/styleParams';
import {clonedWith} from './helpers/cloned-with';
import {readFile} from './helpers/readfile';

describe('runtime', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime');
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
        [entryName]: './tests/fixtures/runtime-entry.ts',
      },
    });

    const {getProcessedCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    runtimeBundleStr = await readFile(path.join(outputDirPath, `${entryName}.bundle.js`), 'utf8');
    getProcessedCss = realFunc;
  });

  it('should support colors from settings', () => {
    const newStyleParams = clonedWith(styleParams, {colors: {color_from_settings: {value: 'red'}}});
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.colors-from-settings {color: rgb(255, 0, 0);}';
    expect(css).toContain(expectedCss);
  });

  it('should support fonts from settings', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        fontFromSettings: {
          value: `font-family:'mr de haviland','cursive';`,
          index: 93,
          cssFontFamily: `'mr de haviland','cursive'`,
          family: 'mr de haviland',
          fontParam: true,
          size: 0,
          style: {
            bold: false,
            italic: false,
            underline: false,
          },
        },
      },
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss =
      '.fonts-from-settings {font: normal normal normal 17px/1.4em "mr de haviland",cursive;text-decoration: ;}';
    expect(css).toContain(expectedCss);
  });

  it('should infer a line height from value', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        fontFromSettings: {
          value: `font:normal normal normal 17px/2em 'mr de haviland','cursive';`,
          index: 93,
          cssFontFamily: `'mr de haviland','cursive'`,
          family: 'mr de haviland',
          fontParam: true,
          size: 0,
          style: {
            bold: false,
            italic: false,
            underline: false,
          },
        },
      },
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.fonts-from-settings {font: normal normal normal 17px/2em';
    expect(css).toContain(expectedCss);
  });

  it('should support font string hack from settings', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        stringHack: {
          value: '100px',
          fontStyleParam: false,
        },
      },
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.font-string-hack {width: 100px;}';
    expect(css).toContain(expectedCss);
  });

  it('should support string default value', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {},
      fonts: {},
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.string-default-value {--stringDefaultValue: 0px; width: 0px;}';
    expect(css).toContain(expectedCss);
  });

  it('should support default values', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {
        default_vals: {value: 'rgba(128,110,66,0.6193647540983607)'},
      },
      fonts: {},
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = ':root {--default_vals: #717070;}';
    const expectedCss2 = '.default-values {color: rgba(128, 110, 66, 0.62);}';
    expect(css).toContain(expectedCss);
    expect(css).toContain(expectedCss2);
  });

  it('should work with declarations with no semicolon at the end', () => {
    const newStyleParams = clonedWith(styleParams, {
      colors: {
        my_var2: {value: 'rgba(128,110,66,0.6193647540983607)'},
      },
    });
    const newSiteTextPresets = clonedWith(siteTextPresets, {
      'Body-M': {
        editorKey: 'font_8',
        fontFamily: 'raleway',
        lineHeight: '1.4em',
        size: '17px',
        style: 'normal',
        value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
        weight: 'normal',
      },
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets: newSiteTextPresets}, {});
    const expectedCss =
      ':root {--cart_textFontStyle:normal normal normal 17px/1.4em raleway,sans-serif; --cartButton_textColor:#FFFFFF;}';
    const expectedCss2 =
      '.no-semicolon {font:normal normal normal 17px/1.4em raleway,sans-serif;text-decoration: ; color:#FFFFFF;}';
    expect(css).toContain(expectedCss);
    expect(css).toContain(expectedCss2);
  });

  it('should not fail on present with none normal font-variant', () => {
    const newSiteTextPresets = clonedWith(siteTextPresets, {
      'Body-M': {
        editorKey: 'font_8',
        fontFamily: 'din-next-w01-light',
        lineHeight: '1.4em',
        size: '16px',
        style: 'normal',
        value: 'font:normal small-caps normal 12px/1.2em play,sans-serif;',
        weight: 'normal',
      },
    });
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets: newSiteTextPresets}, {});
    const expectedCss = '.font-test {font: normal small-caps normal 12px/1.2em play,sans-serif;}';
    expect(css).toContain(expectedCss);
  });

  it('should support double font reference', () => {
    const newSiteTextPresets = clonedWith(siteTextPresets, {
      'Body-M': {
        displayName: 'Paragraph 2',
        editorKey: 'font_8',
        fontFamily: 'din-next-w01-light',
        lineHeight: '1.4em',
        size: '16px',
        style: 'normal',
        value:
          'font:normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif',
        weight: 'normal',
      },
    });
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets: newSiteTextPresets}, {});
    const expectedCss =
      '.font-test2 {--some-font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif; font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;text-decoration: ;}';
    expect(css).toContain(expectedCss);
  });

  it('should calculate nested functions', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.font-test4 {--var: #F3F3F3; color:rgba(255, 255, 255, 0.5);}';
    expect(css).toContain(expectedCss);
  });

  it('should calculate nested functions with multiple functions params', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss =
      '.nested-functions-with-multiple-functions-params {--var: #F3F3F3; color: rgba(255, 255, 255, 0.5)}';
    expect(css).toContain(expectedCss);
  });

  it('opacity with default value', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.opacity-default-value {rule1: rgba(255, 0, 0, 0.5); --lala: #FF0000;}';
    expect(css).toContain(expectedCss);
  });

  it('color transformation', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.color-transformation { rule4: #FFFFFF; rule5: #F3F3F3;}';
    expect(css).toContain(expectedCss);
  });

  it('darken transformation', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.darken-transformation {rule1: rgb(127, 0, 0);}';
    expect(css).toContain(expectedCss);
  });

  it('lighten transformation', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.lighten {rule1: rgb(77, 255, 77);}';
    expect(css).toContain(expectedCss);
  });

  it('whiten transformation', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.whiten {rule1: rgb(140, 106, 178);}';
    expect(css).toContain(expectedCss);
  });

  it('without opacity', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.without-opacity {rule1: rgb(255, 0, 0);}';
    expect(css).toContain(expectedCss);
  });

  it('composed opacity with custom var', () => {
    const newStyleParams = clonedWith(styleParams, {
      colors: {
        opacityWithVar: {value: '#FFFF00'},
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.opacity-with-var {rule1: rgba(255, 255, 0, 0.5);}';
    expect(css).toContain(expectedCss);
  });

  it('join colors', () => {
    const newStyleParams = clonedWith(styleParams, {
      colors: {
        joinColor: {value: '#FF0000'},
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.join-colors {rule1: rgb(255, 255, 0);}';
    expect(css).toContain(expectedCss);
  });

  it('should support number', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {
        numberVar: 42,
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.numbers {width: calc(100% - 42);}';
    expect(css).toContain(expectedCss);
  });

  it('should support unit', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {
        unit_var: 42,
      },
      colors: {
        unit_color_var: {value: '#FF0000'},
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.unit {border: 42px solid #FF0000;}';
    expect(css).toContain(expectedCss);
  });

  it('should support unit with value 0', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {
        unitZero: 0,
      },
      colors: {
        unit_zero_color: {value: '#FF0000'},
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = '.unit-with-value-zero {border: 0px solid #FF0000;}';
    expect(css).toContain(expectedCss);
  });

  it('does not modify static params', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    expect(css).not.toContain('.not-modify-static-params');
  });

  it('does not modify regular css vars', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    expect(css).not.toContain('.not-modify-regular-css-vars');
  });

  it('should work with pseudo selectors', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.datepicker__day--highlighted:hover{background-color: ${getSiteColor(
      'color-1',
      siteColors
    )};}`;
    expect(css).toContain(expectedCss);
  });

  it('should detect declarations with no space after the :', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.no-space-after-colon {rule4: ${getSiteColor('color-9', siteColors)};rule5: ${getSiteColor(
      'color-9',
      siteColors
    )}}`;
    expect(css).toContain(expectedCss);
  });

  it('should support font theme override', () => {
    const newSiteTextPresets = clonedWith(siteTextPresets, {
      'Body-M': {
        editorKey: 'font_8',
        fontFamily: 'raleway',
        lineHeight: '1.4em',
        size: '17px',
        style: 'normal',
        value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
        weight: 'normal',
      },
    });

    const css = getProcessedCss({styleParams, siteColors, siteTextPresets: newSiteTextPresets}, {});
    const expectedCss = `.font-theme-override {font: italic normal bold 10px/2em raleway,sans-serif}`;
    expect(css).toContain(expectedCss);
  });

  it('should support font override with var from settings', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        bodyText: {
          value: `font-family:'mr de haviland','cursive';`,
          index: 93,
          cssFontFamily: `'mr de haviland','cursive'`,
          family: 'mr de haviland',
          fontParam: true,
          size: 0,
          style: {
            bold: false,
            italic: false,
            underline: false,
          },
        },
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.font-override-with-var-from-settings {--bodyText: italic normal bold 10px/2em futura-lt-w01-book,sans-serif; font: normal normal normal 17px/1.4em "mr de haviland",cursive;text-decoration: }`;
    expect(css).toContain(expectedCss);
  });

  it('should handle font without font-family', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        bodyText: {
          family: '',
          style: {
            bold: false,
            italic: false,
            underline: false,
          },
          size: 15,
          preset: 'Custom',
          fontStyleParam: true,
          value: 'font:normal normal normal 15px/18px ;',
        },
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss =
      '.font-without-font-family {font: normal normal normal 15px/1.4em NONE_EXISTS_FONT;text-decoration: };';
    expect(css).toContain(expectedCss);
  });

  it('should handle multiple font-family', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        bodyText: {
          style: {
            bold: false,
            italic: false,
            underline: false,
          },
          family: 'arial black',
          preset: 'Heading-L',
          size: 60,
          fontStyleParam: true,
          value:
            'font:normal normal normal 60px/1.4em "arial black",arial-w01-black,arial-w02-black,"arial-w10 black",sans-serif;',
        },
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss =
      '.font-with-multiple-font-family {font: normal normal normal 60px/1.4em "arial black",arial-w01-black,arial-w02-black,"arial-w10 black",sans-serif;text-decoration: };';
    expect(css).toContain(expectedCss);
  });

  it('should use value property font families if it has >= families compared to family', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        bodyText: {
          style: {
            bold: false,
            italic: false,
            underline: false,
          },
          family: 'arial black',
          preset: 'Heading-L',
          size: 60,
          fontStyleParam: true,
          value: 'font:normal normal normal 60px/1.4em sans-serif;',
        },
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss =
      '.font-with-multiple-font-family {font: normal normal normal 60px/1.4em sans-serif;text-decoration: };';
    expect(css).toContain(expectedCss);
  });

  it('should not use value property font families if it has less families compared to family', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        bodyText: {
          style: {
            bold: false,
            italic: false,
            underline: false,
          },
          family: `'palatino linotype','serif'`,
          preset: 'Heading-L',
          size: 60,
          fontStyleParam: true,
          value: 'font:normal normal normal 60px/1.4em sans-serif;',
        },
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss =
      '.font-with-multiple-font-family {font: normal normal normal 60px/1.4em "palatino linotype",serif;text-decoration: };';
    expect(css).toContain(expectedCss);
  });

  it('should support font override with var', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        bodyText: {
          value: `font-family:'mr de haviland','cursive';`,
          index: 93,
          cssFontFamily: `'mr de haviland','cursive'`,
          family: 'mr de haviland',
          fontParam: true,
          size: 0,
          style: {
            bold: false,
            italic: false,
            underline: false,
          },
        },
      },
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.font-override-with-var {--bodyText2: italic normal bold 10px/2em futura-lt-w01-book,sans-serif; font: italic normal bold 10px/2em futura-lt-w01-book,sans-serif;text-decoration: }`;
    expect(css).toContain(expectedCss);
  });

  it('should support double var reference', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {var1: 1},
    });

    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.double-var-reference {--var1:42; --var2:1; rule4:1;}`;
    expect(css).toContain(expectedCss);
  });

  it('should support undefined variables', () => {
    const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.undefined-variables {--yfyfdydfy:undefined}`;
    expect(css).toContain(expectedCss);
  });

  it('should support underline', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        underlineVar: {
          value: `font-family:'mr de haviland','cursive';`,
          index: 93,
          cssFontFamily: `'mr de haviland','cursive'`,
          family: 'mr de haviland',
          fontParam: true,
          size: 0,
          style: {
            bold: false,
            italic: false,
            underline: true,
          },
        },
      },
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.underlined { font: normal normal normal 17px/1.4em "mr de haviland",cursive;text-decoration: underline }`;
    expect(css).toContain(expectedCss);
  });

  it('fallback css function', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {},
      fonts: {},
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.fallback-colors {color: ${getSiteColor('color-1', siteColors)}}`;
    expect(css).toContain(expectedCss);
  });

  it('fallback should return first none falsy value', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {},
      fonts: {},
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.first-none-falsy {--first_none_falsy: rgb(255, 0, 0); color: rgb(255, 0, 0)}`;
    expect(css).toContain(expectedCss);
  });

  it('fallback should support multiple values', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {},
      fonts: {},
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.fallback-multiple-vals {color: ${getSiteColor('color-1', siteColors)};}`;
    expect(css).toContain(expectedCss);
  });

  it('should support number 0 as true', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {},
      fonts: {},
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.number-zero-none-falsy {--zero_none_falsy: 0; width: 0px;}`;
    expect(css).toContain(expectedCss);
  });

  it('should ignore undefined as true', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {},
      fonts: {},
    });
    const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
    const expectedCss = `.undefined-falsy {width: 1px;}`;
    expect(css).toContain(expectedCss);
  });

  describe('zeroAsTrue css function', () => {
    it('should return 0', () => {
      const newStyleParams = clonedWith(styleParams, {
        numbers: {},
        colors: {},
        fonts: {},
      });
      const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
      const expectedCss = `.return-zero {border-width: 0;}`;
      expect(css).toContain(expectedCss);
    });

    it('should return undefined', () => {
      const newStyleParams = clonedWith(styleParams, {
        numbers: {},
        colors: {},
        fonts: {},
      });
      const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
      const expectedCss = `.return-undefined {border-width: undefined;}`;
      expect(css).toContain(expectedCss);
    });
  });

  describe('calc css function', () => {
    it('should return native calc function concatenated with the operator', () => {
      const newStyleParams = clonedWith(styleParams, {
        numbers: {var1: 1},
        colors: {},
        fonts: {},
      });
      const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
      const expectedCss = `.return-native-calc {padding: 0 calc(2px + 42px);}`;
      expect(css).toContain(expectedCss);
    });

    it('should use return the first number if only one number was given', () => {
      const newStyleParams = clonedWith(styleParams, {
        numbers: {},
        colors: {},
        fonts: {},
      });
      const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
      const expectedCss = `.return-first-number-calc {padding: 2px;}`;
      expect(css).toContain(expectedCss);
    });

    it('should support nested calc', () => {
      const newStyleParams = clonedWith(styleParams, {
        numbers: {},
        colors: {},
        fonts: {},
      });
      const css = getProcessedCss({styleParams: newStyleParams, siteColors, siteTextPresets}, {});
      const expectedCss = `.return-nested-calc {--calcVar1:7; width: calc(2px + 7px + calc(9px - 8px));}`;
      expect(css).toContain(expectedCss);
    });
  });

  describe('Options', () => {
    describe('isRTL', () => {
      it('should support LTR', () => {
        const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
        expect(css).toContain(`.rtl-support {
  padding-left: 9px;
  float: left;
  padding-right: 9px;
  left: 10px;
  right: 10px;
  direction: ltr;
  margin: -5px;
  margin: 5px;
  transform: rotate(0deg);
  transform: rotate(180deg);
}`);
      });

      it('should support RTL', () => {
        const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {isRTL: true});
        expect(css).toContain(`.rtl-support {
  padding-right: 9px;
  float: right;
  padding-left: 9px;
  right: 10px;
  left: 10px;
  direction: rtl;
  margin: 5px;
  margin: -5px;
  transform: rotate(180deg);
  transform: rotate(0deg);
}`);
      });
    });

    describe('prefix', () => {
      it('should not have prefix for selectors if none given', () => {
        const css = getProcessedCss({styleParams, siteColors, siteTextPresets});
        expect(css).toMatch(/}\s*.rtl-support {/);
      });

      it('should have prefix for selectors if given', () => {
        const prefixSelector = '#style-id';
        const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {prefixSelector});
        expect(css).toContain(`${prefixSelector} .rtl-support`);
      });
    });
  });

  describe('bundle inspection', () => {
    it('should not contain multiple custom syntax parts of the same part', () => {
      const count = (runtimeBundleStr.match(/color\(color\-18\)/g) || []).length;
      // 2 in the css + 2 in the extracted metadata
      expect(count).toEqual(2 + 1);
    });

    it('should replace all the instances of the same part', () => {
      const css = getProcessedCss({styleParams, siteColors, siteTextPresets}, {});
      const expectedCss = `.multiple-parts-of-the-same-part {color: ${getSiteColor(
        'color-18',
        siteColors
      )}; background-color: ${getSiteColor('color-18', siteColors)}}`;
      expect(css).toContain(expectedCss);
    });
  });
});
