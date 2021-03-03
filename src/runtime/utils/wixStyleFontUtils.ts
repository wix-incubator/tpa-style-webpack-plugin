import {forEach, isNumber, reduceObj} from './utils';
import parseCssFont, {IFont} from 'parse-css-font';
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

    const parsedFontStyles = reduceObj(fontStyles, (acc, {key, value}) => {
      // Fix color styles due to '.' to '-' conversion
      acc[key.replace(/\./g, '-')] = parseWixStylesFont(value);
      return acc;
    });

    const parsedSiteTextPresets = reduceObj(siteTextPresets, (acc, {key, value: preset}) => {
      const presetValue = cleanWixFontValue(preset.value);
      let parsedCssFont;
      try {
        parsedCssFont = parseCssFont(presetValue);
      } catch (e) {
        parsedCssFont = parseCssFont(presetValue + ' ;');
      }
      acc[key] = {
        ...parsedCssFont,
        preset: key,
        editorKey: preset.editorKey,
        ...(preset.displayName ? {displayName: preset.displayName} : {}),
      };
      return acc;
    });

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
  toFontCssValue(value: Required<IStyleFont>) {
    const size = isNumber(value.size) ? value.size + 'px' : value.size;
    const lineHeight = isNumber(value.lineHeight) ? value.lineHeight + 'px' : value.lineHeight;
    const family =
      typeof value.family === 'string'
        ? value.family
        : value.family.map((val: string) => (val.indexOf(' ') > -1 ? JSON.stringify(val) : val)).join(',');

    return `${value.style} ${value.variant} ${value.weight} ${size}/${lineHeight} ${family}`;
  },
  isStringHack(fontParam: IStyleFont) {
    return fontParam.fontStyleParam === false;
  },
  isValidFontParam(fontParam: IStyleFont) {
    return fontParam.family !== undefined;
  },
};

function cleanWixFontValue(value: string): string {
  return value.replace(/^font\s*:\s*/, '').replace(/\s;$/, '');
}

function parseWixStylesFont(font: IStyleFont) {
  let parsedValue: IFont;
  try {
    parsedValue = parseCssFont(cleanWixFontValue(font.value || '')) as IFont;
  } catch (e) {
    parsedValue = {
      family: [],
    };
  }

  let value = '';

  if (
    (font && font.style === 'italic') ||
    (font && font.style === '<italic>') ||
    (typeof font.style === 'object' && font.style.italic)
  ) {
    value += 'italic ';
  }

  if (font.style && font.style.bold) {
    value += 'bold ';
  }

  let size = font.size || 'normal';
  if (isNumber(size)) {
    size = `${size}px`;
  }
  let lineHeight = font.lineHeight || parsedValue.lineHeight || 'normal';
  if (isNumber(lineHeight)) {
    lineHeight = `${lineHeight}px`;
  }

  value += `${size}/${lineHeight} `;

  value += font.cssFontFamily || font.family || 'NONE_EXISTS_FONT';

  const fontObj = {...parseCssFont(value)} as any;
  if (parsedValue.family && parsedValue.family.length >= fontObj.family.length) {
    fontObj.family = parsedValue.family;
  }

  fontObj.underline = font.style && typeof font.style === 'object' && font.style.underline;
  return fontObj;
}
