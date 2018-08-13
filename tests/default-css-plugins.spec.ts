import {defaultCssPlugins} from '../src/runtime/defaultCssFunctions';

describe('defaultCssPlugins', () => {
  describe('join', () => {
    it('should join 2 colors', () => {
      const color1 = '#ff0000';
      const color2 = '#00ff00';

      expect(defaultCssPlugins.join(color1, 0, color2, 0)).toBe('rgb(255, 255, 0)');
    });

    it('should join 2 colors with alpha', () => {
      const color1 = 'rgba(255,0,0,.5)';
      const color2 = 'rgba(0,255,0,.5)';

      expect(defaultCssPlugins.join(color1, 0, color2, 0)).toBe('rgba(255, 255, 0, 0.5)');
    });
  });

  describe('color', () => {
    it('should return css color', () => {
      expect(defaultCssPlugins.color('red', {colors: {}} as any)).toBe('rgb(255, 0, 0)');
    });

    it('should return css color', () => {
      expect(defaultCssPlugins.color({r: 255, g: 0, b: 0}, {colors: {}} as any)).toBe('rgb(255, 0, 0)');
    });

    it('should return color from tpaParams', () => {
      expect(defaultCssPlugins.color('color-1', {colors: {['color-1']: 'rgb(255, 0, 0)'}} as any))
        .toBe('rgb(255, 0, 0)');
    });

    it('should return hex color', () => {
      expect(defaultCssPlugins.color('#ff0000', {colors: {}} as any)).toBe('#ff0000');
    });

    it('should return empty string for no value', () => {
      expect(defaultCssPlugins.color('', {colors: {}} as any)).toBe('');
      expect(defaultCssPlugins.color(undefined, {colors: {}} as any)).toBe('');
      expect(defaultCssPlugins.color(null, {colors: {}} as any)).toBe('');
    });

    it('should throw an exception when color not parsed', () => {
      expect(() => defaultCssPlugins.color('rgb(bla)', {colors: {}} as any)).toThrowError();
    });
  });

  describe('opacity', () => {
    it('should add opacity', () => {
      expect(defaultCssPlugins.opacity('red', 0.4)).toBe('rgba(255, 0, 0, 0.4)');
    });

    it('should add opacity', () => {
      expect(defaultCssPlugins.opacity('rgba(255,0,0,.8)', 0.5)).toBe('rgba(255, 0, 0, 0.4)');
    });
  });

  describe('withoutOpacity', () => {
    it('should remove opacity', () => {
      expect(defaultCssPlugins.withoutOpacity('rgba(255,0,0,.5)')).toBe('rgb(255, 0, 0)');
    });
  });

  describe('darken', () => {
    it('should add darken', () => {
      expect(defaultCssPlugins.darken('rgb(255,255,255)', 0.5)).toBe('rgb(128, 128, 128)');
    });
  });
});
