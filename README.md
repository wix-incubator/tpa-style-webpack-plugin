# tpa-style-webpack-plugin [![Build Status][ci-img]][ci]
[ci-img]:  https://travis-ci.org/wix-incubator/tpa-style-webpack-plugin.svg?branch=master
[ci]:      https://travis-ci.org/wix-incubator/tpa-style-webpack-plugin
A Webpack plugin that handles wix tpa styles, it extracts the dynamic css from the static css and injects it back to the bundle.

## Requirements

- Node.js v8.9.1 or above
- Webpack 4.x

## Installation

```sh
$ npm install --save-dev tpa-style-webpack-plugin
```

## Usage
Add the plugin to your webpack config.
```js
// webpack.config.js
const ExtractTPAStyles = require('extract-tpa-style-webpack-plugin');

module.exports = {
  module: {
  ...
  },
  plugins: [
    new MiniCssExtractPlugin({filename: '[name].[chunkhash].css'}),
    new ExtractTPAStyles()
  ]
};
```

import [`getProcessedCss`](https://github.com/wix-incubator/tpa-style-webpack-plugin/blob/master/src/runtime/main.ts#L21) functions from plugins runtime in your production code.
```js
import {getProcessedCss} from 'extract-tpa-style-webpack-plugin/runtime';
import {addStyles} from 'extract-tpa-style-webpack-plugin/addStyles';

const dynamicCss = getProcessedCss({styleParams, siteColors, siteTextPresets}, {isRTL: false, prefixSelector: '.style-id'});
addStyles(dynamicCss, 'tag-id');
```

### Supported Css Functions
```css
.my-selector {
    --my-font: "font(Body-M)";                                              /* define a custom variable with a default value */
    --my-font2: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"     /* will use Body-M as base font and override the given attributes */
    --default-width: "number(42)";                                          /* define a numeric custom var */

    font: "font(--my-font)";                                                /* assign a dynamic font value from a custom var */
    width: calc(100% - "number(--default-width)");                          /* assign a dynamic numeric value from a custom var */
    color: "color(color-8)";                                                /* assign a color from the site's palette */
    background-color: "join(opacity(color-1, 0.5), opacity(color-8, 0.5))"; /* blends 2 colors */
    color: "opacity(color-8, 0.3)";                                         /* add opacity to a site palette color */
    color: "withoutOpacity(opacity(color-8, 0.3))";                         /* will remove the opacity of site palette color */
    color: "darken(color-8, 0.3)";                                          /* make a darken version of site palette color */
    font: "font(--my-font2)";                                               /* will use the overridden default unless it was defined in settings  */
    border-width: "unit(--var-from-settings, px)";                          /* will produce border-width: 42px */
    color: "fallback(color(--var-from-settings), color(color-8))";          /* will return the first none falsy value from left to right */
}
```

### Direction support
Expression | RTL | LTR
---- | ---------- | -----------
START | right | left
END | left | right
STARTSIGN | '' | '-'
ENDSIGN | '-' | ''
DEG-START | 180 | 0
DEG-END | 0 | 180
DIR | rtl | ltr

```css
.my-selector {
    padding-START: 9px;   /* START will be replaced with left / right, given rtl = false / true */
    float: START;         /* Same as above, applied to the value */
    padding-END: 9px;     /* END will be replaced with left / right, given rtl = true / false */
    direction: DIR;     /* DIR will be replaced with ltr / rtl, given rtl = false / true */
    margin: STARTSIGN5px; /* STARTSIGN will be replaced with -, given rtl = false, and will be removed for rtl = true */
    margin: ENDSIGN5px;   /* ENDSIGN will be replaced with -, given rtl = true, and will be removed for rtl = false */
    transform: rotate(DEG-STARTdeg);
    transform: rotate(DEG-ENDdeg);
}
```

You can check out an [example project](https://github.com/felixmosh/extract-tpa-style-test).

⚠️ Currently there is no support for usage of `style-loader`, coming soon.

