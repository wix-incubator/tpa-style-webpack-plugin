import {TinyColor} from '@ctrl/tinycolor';
import {ITPAParams} from './generateTPAParams';
import {escapeHtml, isJsonLike, parseJson} from './utils/utils';
import {wixStylesFontUtils} from './utils/wixStyleFontUtils';
import {directionMap, IS_RTL_PARAM} from './constants';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const cssFunctions = {
  join: (color1, strength1, color2, strength2) => {
    color1 = new TinyColor(color1).toRgb();
    color2 = new TinyColor(color2).toRgb();

    //  todo: use strength
    //let color1strength = args[1];
    //let color2strength = args[3];
    const r = (color1.r / 255 + color2.r / 255) * 255;
    const g = (color1.g / 255 + color2.g / 255) * 255;
    const b = (color1.b / 255 + color2.b / 255) * 255;
    const a = (color1.a + color2.a) / 2;

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
  font: (font, tpaParams: ITPAParams): string => {
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
        ...overrides,
      };
    } else if (tpaParams.fonts[font]) {
      fontValue = tpaParams.fonts[font];
    } else {
      return escapeHtml(font);
    }

    let fontCssValue = wixStylesFontUtils.toFontCssValue(fontValue);

    if (fontCssValue[fontCssValue.length - 1] === ';') {
      fontCssValue = fontCssValue.split(';')[0];
    }

    return escapeHtml(fontCssValue);
  },
  opacity: (color, opacity: number): string => {
    const oldColor = new TinyColor(color);
    const newOpacity = oldColor.toRgb().a * opacity;
    return oldColor.setAlpha(newOpacity).toRgbString();
  },
  withoutOpacity: color => {
    return new TinyColor(color).setAlpha(1).toRgbString();
  },
  string: (value: string): string => {
    return escapeHtml(value);
  },
  darken: (colorVal, darkenValue: number): string => {
    return new TinyColor(colorVal).brighten(-1 * darkenValue * 100).toRgbString();
  },
  lighten: (colorVal, lightenVal: number): string => {
    return new TinyColor(colorVal).lighten(lightenVal * 100).toRgbString();
  },
  whiten: (colorVal, whitenVal: number): string => {
    return new TinyColor(colorVal).tint(whitenVal * 100).toRgbString();
  },
  number: (value: number | string): number => {
    return +value;
  },
  underline: (font): string => {
    return font && font.underline ? 'underline' : '';
  },
  unit: (value: number | string, unit: string): string => {
    return escapeHtml(`${value}${unit}`);
  },
  fallback: (...args) => {
    const argsWithoutTPAParams = args.slice(0, -1);
    return argsWithoutTPAParams.filter(Boolean)[0];
  },
  direction: (value: string, tpaParams: ITPAParams): string => {
    const direction = tpaParams.booleans[IS_RTL_PARAM] ? 'rtl' : 'ltr';
    return directionMap[value][direction];
  },
};
