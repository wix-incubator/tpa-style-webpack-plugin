import {forEach} from './utils';
import {ISiteColor, IStyleColor} from '../types';

export const wixStylesColorUtils = {
  getFullColorStyles({colorStyles, siteColors}: { siteColors: ISiteColor[]; colorStyles: { [key: string]: IStyleColor } }) {
    let returnValue: any = {};
    // Fix color styles due to '.' to '-' conversion
    const fixedColorStyles: any = {};

    for (const key in colorStyles) {
      fixedColorStyles[key.replace(/\./g, '-')] = colorStyles[key].value;
    }

    // Helper functions
    // Basic definitions
    returnValue.white = '#FFFFFF';
    returnValue.black = '#000000';
    // Basic template colors
    forEach(siteColors, ({reference, value}) => {
      returnValue[reference] = value;
    });

    returnValue = {...returnValue, ...fixedColorStyles};
    // Fix for a bug in a very specific template
    returnValue.background = (fixedColorStyles.background || {}).value || (returnValue['color-1'] === '#FFFFFF') && (returnValue['color-2'] === '#F4EFE1') ? returnValue['color-2'] : returnValue['color-1'];
    return returnValue;
  }
};
