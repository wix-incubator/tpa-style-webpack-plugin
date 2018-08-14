import {Declaration} from 'postcss';
import {directionReplacer} from '../../../src/lib/replacers';

describe('Replacer - direction', () => {
  let decl: Declaration;

  it('START', () => {
    decl = {prop: 'margin-START', value: '5px'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe('margin-"direction(START)"');
    expect(result.value).toBe(decl.value);
  });

  it('END', () => {
    decl = {prop: 'margin-END', value: '5px'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe('margin-"direction(END)"');
    expect(result.value).toBe(decl.value);
  });

  it('STARTSIGN', () => {
    decl = {prop: 'padding', value: 'STARTSIGN5px'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe(decl.prop);
    expect(result.value).toBe('"direction(STARTSIGN)"5px');
  });

  it('ENDSIGN', () => {
    decl = {prop: 'padding', value: 'ENDSIGN5px'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe(decl.prop);
    expect(result.value).toBe('"direction(ENDSIGN)"5px');
  });

  it('DIR', () => {
    decl = {prop: 'padding', value: 'DIR'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe(decl.prop);
    expect(result.value).toBe('"direction(DIR)"');
  });

  it('DEG-START', () => {
    decl = {prop: 'transform', value: 'rotate(DEG-STARTdeg)'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe(decl.prop);
    expect(result.value).toBe('rotate("direction(DEG-START)"deg)');
  });

  it('DEG-END', () => {
    decl = {prop: 'transform', value: 'rotate(DEG-ENDdeg)'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe(decl.prop);
    expect(result.value).toBe('rotate("direction(DEG-END)"deg)');
  });

  it('STARTSIGN should not be replaced in invalid syntax', () => {
    decl = {prop: 'background', value: 'url(bas64fdsdfSTARTSIGNfdsx)'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe(decl.prop);
    expect(result.value).toBe(decl.value);
  });

  it('should handle multiple replaces', () => {
    decl = {prop: 'background', value: 'ENDSIGN5px DEG-START'} as Declaration;

    const result = directionReplacer(decl);
    expect(result.prop).toBe(decl.prop);
    expect(result.value).toBe('"direction(ENDSIGN)"5px "direction(DEG-START)"');
  });
});
