import {createStyleParamGetter, StyleParamType, IStyles as IStylesStorage} from '@wix/tpa-settings';
import {pickBy} from './utils/utils';
import {wixStylesFontUtils} from './utils/wixStyleFontUtils';
import {wixStylesColorUtils} from './utils/wixStylesColorUtils';
import {IS_RTL_PARAM} from './constants';
import {IOptions, ISiteColor, ISiteTextPreset, IStyleFont, IStyles, IStyleParams, IDefaults} from './types';

export interface ITPAParams {
  colors: {[index: string]: {value: string}};
  numbers: {[index: string]: number};
  booleans: {[index: string]: boolean};
  fonts: Object;
  strings: Object;
}

function overrideStyleParamsWithDefaults(styles: IStyles, defaults: IDefaults | undefined, options: Partial<IOptions>) {
  if (!defaults) {
    return styles.styleParams;
  }

  const getParam = createStyleParamGetter({
    storage: (styles.styleParams as unknown) as IStylesStorage,
    colors: styles.siteColors,
    textPresets: styles.siteTextPresets,
    isRTL: options.isRTL,
    isMobile: options.isMobile,
  });

  const styleParamsMap = {
    [StyleParamType.Number]: styles.styleParams.numbers,
    [StyleParamType.Boolean]: styles.styleParams.booleans,
    [StyleParamType.Font]: styles.styleParams.fonts,
    [StyleParamType.Color]: styles.styleParams.colors,
  };

  Object.keys(defaults).forEach(styleKey => {
    const styleParam = defaults[styleKey];
    // tslint:disable-next-line:deprecation
    const keyWithoutTraits = styleParam.key || styleParam.name;
    const value = getParam(styleParam);
    if (value && keyWithoutTraits) {
      const targetStylesMap = styleParamsMap[styleParam.type];
      targetStylesMap[keyWithoutTraits] = value;
    }
  });

  return styles.styleParams;
}

export function generateTPAParams(
  siteColors: ISiteColor[],
  siteTextPresets: ISiteTextPreset,
  styleParams: IStyleParams,
  options: Partial<IOptions>,
  defaults: IDefaults
): ITPAParams {
  const styleParamsWithDefaults = overrideStyleParamsWithDefaults(
    {
      styleParams,
      siteColors,
      siteTextPresets,
    },
    defaults,
    options
  );

  const colorStyles = styleParamsWithDefaults.colors;
  const fontStyles = pickBy<IStyleFont>(styleParamsWithDefaults.fonts, wixStylesFontUtils.isValidFontParam);

  const numbers = styleParamsWithDefaults.numbers || {};
  const colors = wixStylesColorUtils.getFullColorStyles({colorStyles, siteColors}) || {};
  const fonts = wixStylesFontUtils.getFullFontStyles({fontStyles, siteTextPresets}) || {};
  const strings = pickBy(styleParamsWithDefaults.fonts, wixStylesFontUtils.isStringHack);
  const booleans = {...styleParamsWithDefaults.booleans, [IS_RTL_PARAM]: options.isRTL};
  return {colors, fonts, numbers, strings, booleans};
}
