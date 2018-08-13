import {underlineFontHackSupport} from '../../../src/replacers';
import {Declaration} from 'postcss';

describe('Replacer - underlineFontHack', () => {
  let decl: Declaration;

  it('should add underline declaration', () => {
    decl = {prop: 'font', value: 'font(--xx)', after: jest.fn()} as any;

    underlineFontHackSupport(decl);
    expect(decl.after).toHaveBeenCalledWith('text-decoration: "underline(--xx)"');
  });

  it('should not replace not font declaration', () => {
    decl = {prop: 'color', value: 'font(--xx)', after: jest.fn()} as any;

    underlineFontHackSupport(decl);
    expect(decl.after).not.toHaveBeenCalled();
  });

  it('should not replace not font declaration', () => {
    decl = {prop: 'font', value: 'font(Body-M)', after: jest.fn()} as any;

    underlineFontHackSupport(decl);
    expect(decl.after).not.toHaveBeenCalled();
  });

  it('should return the declaration', () => {
    decl = {prop: 'font', value: 'font(Body-M)', after: jest.fn()} as any;

    const result = underlineFontHackSupport(decl);
    expect(result).toBe(decl);
  });
});
