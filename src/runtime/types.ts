export interface IInjectedData {
  css: string;
  customSyntaxStrs: string[];
  cssVars: {[key: string]: string};
}

export interface IStyles {
  siteColors: ISiteColor[];
  siteTextPresets: ISiteTextPreset;
  styleParams: IStyleParams;
}

export interface IStyleParams {
  numbers: {[key: string]: number};
  booleans: {[key: string]: boolean};
  colors: {[key: string]: IStyleColor};
  fonts: {[s: string]: IStyleFont};
  googleFontsCssUrl: string;
}

export interface IStyleColor {
  value: string;
  themeName?: string;
}

export interface IStyleFont {
  cssFontFamily?: string;
  family?: string;
  index?: number;
  fontStyleParam?: boolean;
  fontParam?: boolean;
  preset?: string;
  size?: number;
  style?: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  value: string;
}

export interface ISiteColor {
  name: string;
  reference: string;
  value: string;
}

export interface ISiteTextPreset {
  'Body-L'?: ITextPreset;
  'Body-M'?: ITextPreset;
  'Body-S'?: ITextPreset;
  'Body-XS'?: ITextPreset;
  'Heading-XL'?: ITextPreset;
  'Heading-L'?: ITextPreset;
  'Heading-M'?: ITextPreset;
  'Heading-S'?: ITextPreset;
  Menu?: ITextPreset;
  'Page-title'?: ITextPreset;
  Title?: ITextPreset;
}

export interface ITextPreset {
  displayName?: string;
  editorKey: string;
  fontFamily: string;
  lineHeight: string;
  size: string;
  style: string;
  value: string;
  weight: string;
}
