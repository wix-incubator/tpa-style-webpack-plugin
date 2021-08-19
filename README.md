## 🚧 This plugin is deprecated in favour of the [private scoped version](https://github.com/wix-private/tpa-style-webpack-plugin) 🚧
---

# tpa-style-webpack-plugin


[![Build Status][ci-img]][ci] [![NPM version][npm-img]][npm] [![code style: prettier][prettier-img]][prettier]

[prettier-img]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat
[prettier]: https://github.com/prettier/prettier
[ci-img]: https://travis-ci.org/wix-incubator/tpa-style-webpack-plugin.svg?branch=master
[ci]: https://travis-ci.org/wix-incubator/tpa-style-webpack-plugin
[npm-img]: https://img.shields.io/npm/v/tpa-style-webpack-plugin.svg
[npm]: https://www.npmjs.com/package/tpa-style-webpack-plugin

A Webpack plugin that handles wix tpa styles, it extracts the dynamic css from the static css and injects it back to the bundle.

## Requirements

- Node.js v8 or above
- Webpack 4.x

## Installation

```sh
$ npm install --save-dev tpa-style-webpack-plugin
```

## Usage

Add the plugin to your webpack config.

<!-- prettier-ignore-start -->
```js
// webpack.config.js
const TpaStyleWebpackPlugin = require('tpa-style-webpack-plugin');

module.exports = {
  module: {
  ...
  },
  plugins: [
    new MiniCssExtractPlugin({filename: '[name].[chunkhash].css'}),
    new TpaStyleWebpackPlugin()
  ]
};
```

## getProcessedCss
import [`getProcessedCss`](https://github.com/wix-incubator/tpa-style-webpack-plugin/blob/master/src/runtime/main.ts#L21) function from plugins runtime in your production code.

```js
import {getProcessedCss} from 'tpa-style-webpack-plugin/runtime';
import {addStyles} from 'tpa-style-webpack-plugin/addStyles';

const dynamicCss = getProcessedCss(
  {styleParams, siteColors, siteTextPresets},
  {isRTL: false, prefixSelector: '.style-id', strictMode: true}
);
addStyles(dynamicCss, 'tag-id');
```
<!-- prettier-ignore-end -->

#### `getProcessedCss` Options

|        Name        |    Type     | Default | Description                                                                         |
| :----------------: | :---------: | :-----: | :---------------------------------------------------------------------------------- |
|     **isRTL**      | `{Boolean}` | `false` | Defines id the [direction replacers](#direction-support) will work on ltr/rtl mode. |
| **prefixSelector** | `{String}`  |  `''`   | Prefix of each selector in the css                                                  |
|   **strictMode**   | `{Boolean}` | `true`  | Defines if the function should throw on invalid css or invalid values.              |

### Supported Css Functions

```css
.my-selector {
    --my-font: "font(Body-M)";                                              /* define a custom variable with a default value */
    --my-font2: "font({theme: 'Body-M', size: '10px', lineHeight: '2em', weight: 'bold', style:'italic'})"     /* will use Body-M as base font and override the given attributes */
    --default-width: "number(42)";                                          /* define a numeric custom var */
    font: "font({theme: 'var-from-settings', size: '32px', lineHeight: '40px'})"; /* will use var-from-settings as base font and override the given attributes */
    font: "font(--my-font)";                                                /* assign a dynamic font value from a custom var */
    width: calc(100% - '"unit(--default-width, px)"');                      /* assign a dynamic numeric value from a custom var */
    width: calc(100% / "number(--default-width)" + 0px);                    /* assign a dynamic numeric value from a custom var */
    color: "color(color-8)";                                                /* assign a color from the site's palette */
    background-color: "join(opacity(color-1, 0.5), opacity(color-8, 0.5))"; /* blends 2 colors */
    color: "opacity(color-8, 0.3)";                                         /* add opacity to a site palette color */
    color: "withoutOpacity(opacity(color-8, 0.3))";                         /* will remove the opacity of site palette color */
    color: "darken(color-8, 0.3)";                                          /* make a darken version of site palette color */
    color: "whiten(color-8, 0.3)";                                          /* make a whiten version of site palette color - Mix the color with pure white, from 0 to 100 */
    color: "lighten(color-8, 0.3)";                                         /* make a lighten version of site palette color - from 0 to 100. Providing 100 will always return white */
    font: "font(--my-font2)";                                               /* will use the overridden default unless it was defined in settings  */
    border-width: "unit(--var-from-settings, px)";                          /* will produce border-width: 42px */
    color: "fallback(color(--var-from-settings), color(color-8))";          /* will return the first none falsy value from left to right */
}
```

### Direction support

| Expression | RTL   | LTR   |
| ---------- | ----- | ----- |
| START      | right | left  |
| END        | left  | right |
| STARTSIGN  | ''    | '-'   |
| ENDSIGN    | '-'   | ''    |
| DEG-START  | 180   | 0     |
| DEG-END    | 0     | 180   |
| DIR        | rtl   | ltr   |

```css
.my-selector {
  padding-start: 9px; /* START will be replaced with left / right, given rtl = false / true */
  float: START; /* Same as above, applied to the value */
  padding-end: 9px; /* END will be replaced with left / right, given rtl = true / false */
  direction: DIR; /* DIR will be replaced with ltr / rtl, given rtl = false / true */
  margin: STARTSIGN5px; /* STARTSIGN will be replaced with -, given rtl = false, and will be removed for rtl = true */
  margin: ENDSIGN5px; /* ENDSIGN will be replaced with -, given rtl = true, and will be removed for rtl = false */
  transform: rotate(DEG-STARTdeg);
  transform: rotate(DEG-ENDdeg);
}
```

You can check out an [example project](https://github.com/felixmosh/extract-tpa-style-test).

## getStaticCss

Use it to inject the static css content to your .js bundle

## Comparison to [wix-style-processor](https://github.com/wix/wix-style-processor)

This plugin was written in order to add support for **SSR** to Wix tpa dynamic styles as part of OOI project.

It uses the same syntax as `wix-style-proccesor` but it works completely different, instead of searching the DOM for style tags with special syntax, it extracts the special syntax css, prepare all the data-structure that is needed at **build-time** and then exposes a function that given site params (colors, settings etc...) at **run-time** returns the `css` as a **string**.

You can use a [built in method](https://github.com/wix-incubator/tpa-style-webpack-plugin/blob/master/addStyles.js#L34) to inject it as a style tag or use your framework to render the style tag.

### Usage example (React)

```javascript
import React from "react";
import {getProcessedCss} from "tpa-style-webpack-plugin/runtime";

export const withStyles = (Component, options) => {
  return function WithStyles(props) {
    const {isRTL, siteStyles, styleId} = props;

    const dynamicCss = getProcessedCss(siteStyles, {
      prefixSelector: styleId ? `.${styleId}` : "",
      isRTL: !!isRTL,
      strictMode: !!options.strictMode,
    });

    return (
      <div className={styleId}>
        <style dangerouslySetInnerHTML={{__html: dynamicCss}} />
        <Component {...props} />
      </div>
    );
  };
};
```

## ⚠️ Caveats

- If you use [cssnano](https://cssnano.co/) to minify CSS, be aware of the following limitations:

  - Don't mix static and dynamic values inside of `border` shorthand declaration ([see the issue](https://github.com/cssnano/cssnano/issues/402)):

    ```css
    .my-selector {
      /* DON'T */
      border: "unit(--var-from-settings, px)" solid "color(color-1)"; /* `cssnano` will remove the dynamic values, and it will become "border: solid;" */

      /* DO */
      border-width: "unit(--var-from-settings, px)";
      border-style: solid;
      border-color: "color(color-1)";
    }
    ```

  - If you use percentages and dynamic values together inside of `calc`, you need to have mixed units in order to [opt out of `calc` minification](https://github.com/MoOx/reduce-css-calc/pull/9/files#diff-168726dbe96b3ce427e7fedce31bb0bcR54):

    ```css
    .my-selector {
      /* DON'T */
      width: calc(100% / "number(4)"); /* `reduce-css-calc` (used by `cssnano`) will transform it to "calc(1 / 4)" */

      /* DO */
      width: calc(100% / "number(4)" + 0px); /* notice 0px here */
    }
    ```

- Currently there is no support for usage of [`style-loader`](https://github.com/webpack-contrib/style-loader), coming soon.
