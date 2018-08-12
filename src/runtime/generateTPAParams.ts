import {pickBy} from './utils/utils';
import {wixStylesFontUtils} from './utils/wixStyleFontUtils';
import {wixStylesColorUtils} from './utils/wixStylesColorUtils';

export interface ITPAParams {
  colors: { [index: string]: { value: string } };
  numbers: { [index: string]: number };
  fonts: Object;
  strings: Object;
}

export function generateTPAParams(siteColors, siteTextPresets, styleParams): ITPAParams {
  const colorStyles = styleParams.colors;
  const fontStyles = pickBy(styleParams.fonts, wixStylesFontUtils.isValidFontParam);

  const numbers = styleParams.numbers || {};
  const colors = wixStylesColorUtils.getFullColorStyles({colorStyles, siteColors}) || {};
  const fonts = wixStylesFontUtils.getFullFontStyles({fontStyles, siteTextPresets}) || {};
  const strings = pickBy(styleParams.fonts, wixStylesFontUtils.isStringHack);
  return {colors, fonts, numbers, strings};
}
