import {ISiteColor} from '../../src/runtime/types';

export const getSiteColor = (colorsRef: string, siteColorList: ISiteColor[]) => {
  return siteColorList.filter(ele => ele.reference === colorsRef)[0].value;
};

export const siteColors: ISiteColor[] = [
  {
    name: 'color_1',
    value: '#FFFFFF',
    reference: 'color-1',
  },
  {
    name: 'color_2',
    value: '#000000',
    reference: 'black/white',
  },
  {
    name: 'color_3',
    value: '#ED1C24',
    reference: 'primery-1',
  },
  {
    name: 'color_4',
    value: '#0088CB',
    reference: 'primery-2',
  },
  {
    name: 'color_5',
    value: '#FFCB05',
    reference: 'primery-3',
  },
  {
    name: 'color_11',
    value: '#FFFFFF',
    reference: 'color-1',
  },
  {
    name: 'color_12',
    value: '#F3F3F3',
    reference: 'color-2',
  },
  {
    name: 'color_13',
    value: '#AAA8A8',
    reference: 'color-3',
  },
  {
    name: 'color_14',
    value: '#717070',
    reference: 'color-4',
  },
  {
    name: 'color_15',
    value: '#000000',
    reference: 'color-5',
  },
  {
    name: 'color_16',
    value: '#FFDDE7',
    reference: 'color-6',
  },
  {
    name: 'color_17',
    value: '#FFA0BB',
    reference: 'color-7',
  },
  {
    name: 'color_18',
    value: '#FF5E8B',
    reference: 'color-8',
  },
  {
    name: 'color_19',
    value: '#FF0000',
    reference: 'color-9',
  },
  {
    name: 'color_20',
    value: '#00FF00',
    reference: 'color-10',
  },
  {
    name: 'color_21',
    value: '#FFC7FF',
    reference: 'color-11',
  },
  {
    name: 'color_22',
    value: '#FE8AFF',
    reference: 'color-12',
  },
  {
    name: 'color_23',
    value: '#D01FD1',
    reference: 'color-13',
  },
  {
    name: 'color_24',
    value: '#6C116C',
    reference: 'color-14',
  },
  {
    name: 'color_25',
    value: '#360836',
    reference: 'color-15',
  },
  {
    name: 'color_26',
    value: '#B6E4EF',
    reference: 'color-16',
  },
  {
    name: 'color_27',
    value: '#8FD0DF',
    reference: 'color-17',
  },
  {
    name: 'color_28',
    value: '#3AB3CF',
    reference: 'color-18',
  },
  {
    name: 'color_29',
    value: '#27788A',
    reference: 'color-19',
  },
  {
    name: 'color_30',
    value: '#133C45',
    reference: 'color-20',
  },
  {
    name: 'color_31',
    value: '#F8C7BD',
    reference: 'color-21',
  },
  {
    name: 'color_32',
    value: '#F1A99A',
    reference: 'color-22',
  },
  {
    name: 'color_33',
    value: '#EB5E42',
    reference: 'color-23',
  },
  {
    name: 'color_34',
    value: '#9C3F2C',
    reference: 'color-24',
  },
  {
    name: 'color_35',
    value: '#4E1F16',
    reference: 'color-25',
  },
];
