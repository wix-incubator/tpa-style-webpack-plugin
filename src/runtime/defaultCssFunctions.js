"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Color = require("color");
var hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
exports.defaultCssFunctions = {
    join: function (color1, strength1, color2, strength2) {
        color1 = new Color(color1);
        color2 = new Color(color2);
        //todo: use strength
        //let color1strength = args[1];
        //let color2strength = args[3];
        var r = ((color1.red() / 255 + color2.red() / 255) * 255);
        var g = ((color1.green() / 255 + color2.green() / 255) * 255);
        var b = ((color1.blue() / 255 + color2.blue() / 255) * 255);
        var a = ((color1.alpha() + color2.alpha()) / 2);
        return new Color({ r: r, g: g, b: b }).alpha(a).rgb().string();
    },
    color: function (colorValue, tpaParams) {
        if (tpaParams.colors[colorValue]) {
            return tpaParams.colors[colorValue];
        }
        try {
            if (hexColorRegex.test(colorValue)) {
                return colorValue;
            }
            return new Color(colorValue).rgb().string();
        }
        catch (e) {
            throw "Unparsable color " + colorValue;
        }
    },
    font: function (font, tpaParams) {
        var fontValue;
        if (typeof font === 'object') {
            fontValue = font;
        }
        else if (isJsonLike(font)) {
            var _a = parseJson(font), theme = _a.theme, overrides = __rest(_a, ["theme"]);
            fontValue = Object.assign({
                style: '',
                variant: '',
                weight: '',
                stretch: '',
                size: '',
                lineHeight: '',
                family: []
            }, tpaParams.fonts[theme], overrides);
        }
        else if (tpaParams.fonts[font]) {
            fontValue = tpaParams.fonts[font];
        }
        else {
            return font;
        }
        var fontCssValue = wixStylesFontUtils.toFontCssValue(fontValue);
        if (fontCssValue[fontCssValue.length - 1] === ';') {
            fontCssValue = fontCssValue.split(';')[0];
        }
        else {
            //todo: else never reached
        }
        return fontCssValue;
    },
    opacity: function (color, opacity) {
        return (new Color(color)).fade(1 - opacity).rgb().string();
    },
    withoutOpacity: function (color) {
        return (new Color(color)).alpha(1).rgb().string();
    },
    string: function (value) {
        return value;
    },
    darken: function (colorVal, darkenValue) {
        return (new Color(colorVal)).darken(darkenValue).rgb().string();
    },
    number: function (value) {
        return +value;
    },
    underline: function (font) {
        return font && font.underline ? 'underline' : '';
    },
    unit: function (value, unit) {
        return "" + value + unit;
    }
};
