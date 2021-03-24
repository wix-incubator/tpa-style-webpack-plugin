import {createStylesParams, StyleParamType, wixColorParam, wixFontParam} from '@wix/tpa-settings';

// key definitions with defaults
export const stylesKeyDefinitions = createStylesParams<{
  backgroundColor: StyleParamType.Color;
  borderRadius: StyleParamType.Number;
  textFont: StyleParamType.Font;
}>({
  borderRadius: {
    type: StyleParamType.Number,
    getDefaultValue() {
      return 10;
    },
  },
  backgroundColor: {
    type: StyleParamType.Color,
    getDefaultValue: wixColorParam('color-3'),
  },
  textFont: {
    type: StyleParamType.Font,
    getDefaultValue: wixFontParam('Body-L'),
  },
});
