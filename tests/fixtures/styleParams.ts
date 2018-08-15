import {IStyleParams} from '../../src/runtime/types';

export const styleParams: IStyleParams = {
  'colors': {
    'gallery_priceColor': {
      'themeName': 'color-5',
      'value': 'rgba(48,48,48,1)'
    }
  },
  'numbers': {
    'cartWidgetIcon': 2,
    'iconLink': 1,
    'borderWidth': 2
  },
  'booleans': {
    'key': false
  },
  'fonts': {
    'buttonTextFont': {
      'fontStyleParam': true,
      'style': {
        'bold': false,
        'italic': false,
        'underline': true
      },
      'size': 25,
      'preset': 'Custom',
      'family': 'raleway-semibold',
      'value': 'font:normal normal normal 15px/18px raleway-semibold,raleway,sans-serif;'
    }
  },
  'googleFontsCssUrl': '//fonts.googleapis.com/css?family=Raleway:n,b,i,bi|&subset=hebrew,arabic,latin'
};
