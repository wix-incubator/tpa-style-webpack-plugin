import {forEach, isNumber} from './utils';
import parseCssFont from 'parse-css-font';
import {ISiteTextPreset, IStyleFont} from '../types';

export const wixStylesFontUtils = {
  getFullFontStyles({
    fontStyles,
    siteTextPresets,
  }: {
    fontStyles: {[s: string]: IStyleFont};
    siteTextPresets: ISiteTextPreset;
  }) {
    let ret = {} as any;

    // Fix color styles due to '.' to '-' conversion
    const fixedFontStyles = {};
    forEach(fontStyles, (v, k: string) => (fixedFontStyles[k.replace(/\./g, '-')] = v));

    const parsedSiteTextPresets = {};
    forEach(siteTextPresets, (preset: any, key: string) => {
      const presetValue = preset.value.replace(/^font\s*:\s*/, '');
      parsedSiteTextPresets[key] = {
        ...parseCssFont(presetValue),

        preset: key,
        editorKey: preset.editorKey,
        ...(preset.displayName ? {displayName: preset.displayName} : {}),
      };
    });

    const parsedFontStyles = {};
    forEach(fixedFontStyles, (value, key) => (parsedFontStyles[key] = parseWixStylesFont(value)));

    // Basic template colors
    forEach(parsedSiteTextPresets, (preset, key) => (ret[key] = parsedFontStyles[key] || preset));

    // LIGHT/MEDIUM/STRONG
    ret.LIGHT = parseCssFont('12px HelveticaNeueW01-45Ligh');
    ret.MEDIUM = parseCssFont('12px HelveticaNeueW01-55Roma');
    ret.STRONG = parseCssFont('12px HelveticaNeueW01-65Medi');

    ret = {...ret, ...parsedFontStyles};

    forEach(ret, (font, key) => {
      ret[key] = {...font, supports: {uppercase: true}};

      if (['snellroundhandw', 'niconne'].some(fontName => font.family.indexOf(fontName) > -1)) {
        ret[key].supports.uppercase = false;
      }

      if (ret[key].lineHeight === 'normal') {
        ret[key].lineHeight = '1.4em'; // Wix's normal line height is 1.4em...
      }

      if (ret[key].size === 'normal') {
        ret[key].size = '17px';
      }
    });

    return ret;
  },
  toFontCssValue(value) {
    const size = isNumber(value.size) ? value.size + 'px' : value.size;
    const lineHeight = isNumber(value.lineHeight) ? value.lineHeight + 'px' : value.lineHeight;

    return `${value.style} ${value.variant} ${value.weight} ${size}/${lineHeight} ${value.family.join(',')}`;
  },
  isStringHack(fontParam) {
    return fontParam.fontStyleParam === false;
  },
  isValidFontParam(fontParam) {
    return fontParam.family !== undefined;
  },
};

function parseWixStylesFont(font) {
  let value = '';

  if (font.style.italic) {
    value = 'italic ';
  }

  if (font.style.bold) {
    value += 'bold ';
  }

  let size = font.size || 'normal';
  if (isNumber(size)) {
    size = `${size}px`;
  }
  let lineHeight = font.lineHeight || 'normal';
  if (isNumber(lineHeight)) {
    lineHeight = `${lineHeight}px`;
  }

  value += `${size}/${lineHeight} `;

  value += font.cssFontFamily || font.family;
  const fontObj: any = {...parseCssFont(value)};
  fontObj.underline = font.style && font.style.underline;
  return fontObj;
}
