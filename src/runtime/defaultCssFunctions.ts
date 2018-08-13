import {TinyColor} from '@ctrl/tinycolor';
import {ITPAParams} from './generateTPAParams';
import {isJsonLike, parseJson} from './utils/utils';
import {wixStylesFontUtils} from './utils/wixStyleFontUtils';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const defaultCssPlugins = {
  join: (color1, strength1, color2, strength2) => {

    color1 = new TinyColor(color1).toRgb();
    color2 = new TinyColor(color2).toRgb();

    //todo: use strength
    //let color1strength = args[1];
    //let color2strength = args[3];
    const r = ((color1.r / 255 + color2.r / 255) * 255);
    const g = ((color1.g / 255 + color2.g / 255) * 255);
    const b = ((color1.b / 255 + color2.b / 255) * 255);
    const a = ((color1.a + color2.a) / 2);

    return new TinyColor({r, g, b, a}).toRgbString();
  },
  color: (colorValue, tpaParams: ITPAParams) => {
    if (tpaParams.colors[colorValue]) {
      return tpaParams.colors[colorValue];
    }

    if (hexColorRegex.test(colorValue)) {
      return colorValue;
    } else if (colorValue) {
      const color = new TinyColor(colorValue);
      if (color.isValid) {
        return color.toRgbString();
      } else {
        throw new Error(`Unparsable color ${colorValue}`);
      }
    } else {
      return '';
    }
  },
  font: (font, tpaParams: ITPAParams) => {
    let fontValue;
    if (typeof font === 'object') {
      fontValue = font;
    } else if (isJsonLike(font)) {
      const {theme, ...overrides} = parseJson(font);
      fontValue = {
        style: '',
        variant: '',
        weight: '',
        stretch: '',
        size: '',
        lineHeight: '',
        family: [],
        ...tpaParams.fonts[theme],
        ...overrides
      };
    } else if (tpaParams.fonts[font]) {
      fontValue = tpaParams.fonts[font];
    } else {
      return font;
    }

    let fontCssValue = wixStylesFontUtils.toFontCssValue(fontValue);

    if (fontCssValue[fontCssValue.length - 1] === ';') {
      fontCssValue = fontCssValue.split(';')[0];
    } else {
      //todo: else never reached
    }

    return fontCssValue;

  },
  opacity: (color, opacity) => {
    const oldColor = new TinyColor(color);
    const newOpacity = oldColor.toRgb().a * opacity;
    return oldColor.setAlpha(newOpacity).toRgbString();
  },
  withoutOpacity: (color) => {
    return new TinyColor(color).setAlpha(1).toRgbString();
  },
  string: (value) => {
    return value;
  },
  darken: (colorVal, darkenValue) => {
    return new TinyColor(colorVal).darken(darkenValue * 100).toRgbString();
  },
  number: (value) => {
    return +value;
  },
  underline: (font) => {
    return font && font.underline ? 'underline' : '';
  },
  unit: (value, unit) => {
    return `${value}${unit}`;
  },
  fallback: (...args) => {
    const argsWithoutTPAParams = args.slice(0, -1);
    return argsWithoutTPAParams.filter(Boolean)[0];
  }
};
