import * as path from 'path';
import { clearDir } from './helpers/clear-dir';
import { runWebpack } from './helpers/run-webpack';
import { IGetProcessedCssFn } from '../src/runtime/main';
import { siteColors, getSiteColor } from './fixtures/siteColors';
import { siteTextPresets } from './fixtures/siteTextPresets';
import { styleParams } from './fixtures/styleParams';
import { clonedWith } from './helpers/cloned-with';

describe('runtime', () => {
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

  it('should not fail on present with none normal font-variant', () => {
    const newSiteTextPresets = clonedWith(siteTextPresets,
      {
        'Body-M': {
          editorKey: 'font_8',
          fontFamily: 'din-next-w01-light',
          lineHeight: '1.4em',
          size: '16px',
          style: 'normal',
          value: 'font:normal small-caps normal 12px/1.2em play,sans-serif;',
          weight: 'normal'
        }
      });
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets: newSiteTextPresets }, {});
    const expectedCss = '.font-test {font: normal normal normal 12px/1.2em play,sans-serif;}';
    expect(css).toContain(expectedCss);
  });

  it('should support double font reference', () => {
    const newSiteTextPresets = clonedWith(siteTextPresets,
      {
        'Body-M': {
          displayName: 'Paragraph 2',
          editorKey: 'font_8',
          fontFamily: 'din-next-w01-light',
          lineHeight: '1.4em',
          size: '16px',
          style: 'normal',
          value: 'font:normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif',
          weight: 'normal'
        }
      });
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets: newSiteTextPresets }, {});
    const expectedCss = '.font-test2 {--some-font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif; font: normal normal normal 16px/1.4em din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif;text-decoration: ;}';
    expect(css).toContain(expectedCss);
  });

  // failing ::after is not included in the CSS
  xit('should not calculate empty strings', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.font-test3::after {content: "t";}`;
    expect(css).toContain(expectedCss);
  });

  it('should calculate nested functions', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.font-test4 {--var: #F3F3F3; color:rgba(255, 255, 255, 0.5);}';
    expect(css).toContain(expectedCss);
  });

  it('opacity with default value', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo7 {rule1: rgba(255, 0, 0, 0.5); --lala: #FF0000;}';
    expect(css).toContain(expectedCss);
  });

  // failing rule and rule3 are not in the CSS
  xit('color transformation', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo8 {rule: bar; rule3: baz; rule4: #FFFFFF; rule5: #F3F3F3;}';
    expect(css).toContain(expectedCss);
  });

  it('darken transformation', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo9 {rule1: rgb(127, 0, 0);}';
    expect(css).toContain(expectedCss);
  });

  it('without opacity', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo10 {rule1: rgb(255, 0, 0);}';
    expect(css).toContain(expectedCss);
  });

  it('composed opacity with custom var', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        colors: {
          foo: { value: '#FFFF00' }
        }
      })

    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo11 {rule1: rgba(255, 255, 0, 0.5);}';
    expect(css).toContain(expectedCss);
  });

  it('join', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        colors: {
          foo: { value: '#FF0000' }
        }
      })

    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo12 {rule1: rgb(255, 255, 0);}';
    expect(css).toContain(expectedCss);
  });

  it('should support number', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        numbers: {
          foo: 42
        },
        colors: {
          bar: { value: '#FF0000' }
        }
      })

    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo13 {width: calc(100% - 42);}';
    expect(css).toContain(expectedCss);
  });

  it('should support unit', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        numbers: {
          foo: 42
        },
        colors: {
          bar: { value: '#FF0000' }
        }
      })

    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo14 {border: 42px solid #FF0000;}';
    expect(css).toContain(expectedCss);
  });

  it('should support unit with value 0', () => {
    const newStyleParams = clonedWith(styleParams,
      {
        numbers: {
          foo: 0
        },
        colors: {
          bar: { value: '#FF0000' }
        }
      })

    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo15 {border: 0px solid #FF0000;}';
    expect(css).toContain(expectedCss);
  });

  xit('does not modify static params', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo16 {padding: 10px 11px 12px 13px;margin-right: 20px;color: blue;}';
    expect(css).toContain(expectedCss);
  });

  xit('does not modify regular css vars', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = '.foo17 {--bar: var(42);--baz: var(21);padding: --baz;}';
    expect(css).toContain(expectedCss);
  });

  it('should work with pseudo selectors', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.datepicker__day--highlighted:hover{background-color: ${getSiteColor('color-1', siteColors)};}`;
    expect(css).toContain(expectedCss);
  });

  it('should detect declarations with no space after the :', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.no-space-after-colon {rule4: ${getSiteColor('color-9', siteColors)};rule5: ${getSiteColor('color-9', siteColors)}}`;
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
        weight: 'normal'
      }
    })

    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets: newSiteTextPresets }, {});
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
            underline: false
          }
        }
      }
    });

    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.font-override-with-var-from-settings {--bodyText: italic normal bold 10px/2em futura-lt-w01-book,sans-serif; font: normal normal normal 17px/1.4em mr de haviland,cursive;text-decoration: }`;
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
            underline: false
          }
        }
      }
    });

    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.font-override-with-var {--bodyText2: italic normal bold 10px/2em futura-lt-w01-book,sans-serif; font: italic normal bold 10px/2em futura-lt-w01-book,sans-serif;text-decoration: }`;
    expect(css).toContain(expectedCss);
  });

  it('should support double var reference', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: { var1: 1 }
    });

    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.double-var-reference {--var1:42; --var2:1; rule4:1;}`;
    expect(css).toContain(expectedCss);
  });

  it('should support undefined variables', () => {
    const css = getProcessedCss({ styleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.undefined-variables {--yfyfdydfy:undefined}`;
    expect(css).toContain(expectedCss);
  });

  it('should support underline', () => {
    const newStyleParams = clonedWith(styleParams, {
      fonts: {
        fontVar: {
          value: `font-family:'mr de haviland','cursive';`,
          index: 93,
          cssFontFamily: `'mr de haviland','cursive'`,
          family: 'mr de haviland',
          fontParam: true,
          size: 0,
          style: {
            bold: false,
            italic: false,
            underline: true
          }
        }
      }
    });
    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.underlined { font: normal normal normal 17px/1.4em mr de haviland,cursive;text-decoration: underline }`;
    expect(css).toContain(expectedCss);
  });

  it('fallback css function', () => {
    const newStyleParams = clonedWith(styleParams, {
      numbers: {},
      colors: {},
      fonts: {}
    });
    const css = getProcessedCss({ styleParams: newStyleParams, siteColors, siteTextPresets }, {});
    const expectedCss = `.fallback-colors {color: ${getSiteColor('color-1', siteColors)}}`;
    expect(css).toContain(expectedCss);
  });
});

//   it('should return first none falsy value', () => {
//       const css = '.foo {--my_var3: red; color: "fallback(color(--my_var3), color(color-1))";}';
//       driver
//           .given.css(css)
//           .given.styleParams({
//           numbers: {},
//           colors: {},
//           fonts: {}
//       })
//           .given.siteTextPresets({});

//       return driver.when.init()
//           .then(() => {
//               expect(driver.get.overrideStyleCallArg()).to.equal('.foo{--my_var3: red;color: rgb(255, 0, 0);}');
//           });
//   });

//   it('should support multiple values', () => {
//       const css = '.foo {color: "fallback(--my_var2, --my_var3, color(color-1))";}';
//       driver
//           .given.css(css)
//           .given.styleParams({
//           numbers: {},
//           colors: {},
//           fonts: {}
//       })
//           .given.siteTextPresets({});

//       return driver.when.init()
//           .then(() => {
//               expect(driver.get.overrideStyleCallArg()).to.equal('.foo{color: #FFFFFF;}');
//           });
//   });
// });

// describe('As Standalone', () => {
//   beforeEach(() => {
//       const css = `.foo {bar: 4; color: "color(color-1)"}`;

//       driver
//           .given.css(css)
//           .given.styleParams(null)
//           .given.siteTextPresets(null)
//           .given.resetSiteColors()
//           .given.declarationReplacerPlugin((key, val) => ({
//           key,
//           value: '#' + val + '#'
//       }));
//   });

//   describe('withoutStyleCapabilites', () => {
//       it('should not apply css functions', () => {
//           driver.given.withoutWixStyles();
//           return driver.when.init().then(() => {
//               expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
//           });
//       });
//   });

//   describe('inStandaloneMode', () => {
//       beforeEach(() => {
//           driver.given.inStandaloneMode();
//       });

//       it('should finish init', () => {
//           return driver.when.init().then(() => {
//               expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
//           });
//       });

//       it('should not apply css functions', () => {
//           return driver.when.init().then(() => {
//               expect(driver.get.overrideStyleCallArg()).to.equal('.foo{bar: #4#;color: #"color(color-1)"#;}');
//           });
//       });
//   });
// });

// describe('In Editor', () => {
//   beforeEach(() => {
//       driver.given.inEditorMode();
//   });

//   it('should update style on style change event', () => {
//       const css = `.foo { --bar: "color(color-4)"; color: "color(--bar)"}`;

//       driver.given.css(css);

//       return driver.when.init()
//           .then(() => {
//               driver.given.styleParams({
//                   colors: {
//                       bar: {value: '#ffffff'}
//                   }
//               });
//           })
//           .then(driver.when.updateStyleParams)
//           .then(() => {
//               expect(driver.get.overrideStyleCallArg(1)).to.equal('.foo{--bar: #717070;color: #ffffff;}');
//           });
//   });

//   describe('Enhanced mode', () => {
//       const color = '"join(darken(color(color-9), 0.5), 0.5, color(color-10), 0.5)"';
//       const borderWidth = '"unit(number(--borderWidth), string(px))"';
//       const borderColor = '"withoutOpacity(opacity(color(color-1), 0.5))"';
//       const font = `"font({theme: 'Body-M', size: '30px'})"`;
//       const fontVar = `--fontVar`;
//       const fontWithUnderline = `"font(${fontVar})"`;
//       const underline = `"underline(${fontVar})"`;

//       beforeEach(() => {
//           driver.given.cssVarsSupported(true)
//               .given
//               .css(`.foo {color: ${color}; border: ${borderWidth} solid ${borderColor}; font: ${font}; font: ${fontWithUnderline}`)
//               .given.styleParams({
//               numbers: {borderWidth: 42},
//               fonts: {
//                   fontVar: {
//                       value: `font-family:'mr de haviland','cursive';`,
//                       index: 93,
//                       cssFontFamily: `'mr de haviland','cursive'`,
//                       family: 'mr de haviland',
//                       fontParam: true,
//                       size: 0,
//                       style: {
//                           bold: false,
//                           italic: false,
//                           underline: true
//                       }
//                   }
//               }
//           })
//               .given.siteTextPresets({
//               'Body-M': {
//                   editorKey: 'font_8',
//                   fontFamily: 'raleway',
//                   lineHeight: '1.4em',
//                   size: '17px',
//                   style: 'normal',
//                   value: 'font:normal normal normal 17px/1.4em raleway,sans-serif;',
//                   weight: 'normal'
//               }
//           });
//       });

//       it('should change custom syntax to native vars', () => {
//           return driver.when.init()
//               .then(() => expect(driver.get.overrideStyleCallArg()).to
//                   .equal(`.foo{color: var(--${hash(color)});border: var(--${hash(borderWidth)}) solid var(--${hash(borderColor)});font: var(--${hash(font)});font: var(--${hash(fontWithUnderline)});text-decoration: var(--${hash(underline)});}`));
//       });

//       it('should evaluate custom functions on style update', () => {
//           const newValues = {
//               number: 42,
//               color: '#000000'
//           };
//           return driver.when.init()
//               .then(() => {
//                   driver.given.siteColor('color-1', newValues.color)
//                       .given.siteColor('color-9', '#0000FF');
//               })
//               .then(driver.when.updateStyleParams)
//               .then(() => {
//                   expect(driver.get.updateCssVarsCallArg(1)).to
//                       .eql({
//                           [`--${hash(color)}`]: 'rgb(0, 255, 128)',
//                           [`--${hash(borderWidth)}`]: `${newValues.number}px`,
//                           [`--${hash(borderColor)}`]: 'rgb(0, 0, 0)',
//                           [`--${hash(font)}`]: 'normal normal normal 30px/1.4em raleway,sans-serif',
//                           [`--${hash(fontWithUnderline)}`]: 'normal normal normal 17px/1.4em mr de haviland,cursive',
//                           [`--${hash(underline)}`]: 'underline'
//                       });
//               });
//       });

//       it('should allow to override shouldUseCssVars by options', () => {
//           return driver
//               .when.init({shouldUseCssVars: false})
//               .then(() => expect(driver.get.overrideStyleCallArg()).to
//                   .equal(`.foo{color: rgb(128, 255, 0);border: 42px solid rgb(255, 255, 255);font: normal normal normal 30px/1.4em raleway,sans-serif;font: normal normal normal 17px/1.4em mr de haviland,cursive;text-decoration: underline;}`));
//       });
//   });
// });
