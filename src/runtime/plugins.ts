import {ITPAParams} from './generateTPAParams';
import {parenthesisAreBalanced} from './utils/utils';

const paramsRegex = /,(?![^(]*(?:\)|}))/g;

export class Plugins {
  public cssFunctions: { [index: string]: Function };
  public declarationReplacers: Function[];

  private regex: RegExp;

  constructor() {
    this.resetPlugins();
  }

  public addCssFunction(funcName: string, func: Function) {
    this.cssFunctions[funcName] = wrapWithValueProvider(func);
    this.updateRegex();
  }

  public addDeclarationReplacer(func: Function) {
    this.declarationReplacers.push(func);
  }

  public resetPlugins() {
    this.cssFunctions = {};
    this.declarationReplacers = [];
    this.regex = undefined;
  }

  public isSupportedFunction(str: any) {
    return this.regex.test(str);
  }

  public getFunctionSignature(str: string): { funcName: string; args: string[] } {
    const groups = this.regex.exec(str);
    if (groups) {
      return {
        funcName: groups[1],
        args: this.extractArguments(groups[2])
      };
    }

    return null;
  }

  private extractArguments(argsString: string): string[] {
    const result = argsString.split(paramsRegex)
      .reduce((acc, currentPart: string) => {

        acc.tmpParts = acc.tmpParts.concat(currentPart);
        const tmpStr = acc.tmpParts.join(',');

        if (parenthesisAreBalanced(tmpStr)) {
          acc.args.push(tmpStr);
          acc.tmpParts.length = 0;
        }

        return acc;
      }, {args: [], tmpParts: []});

    if (result.tmpParts.length > 0) {
      throw new Error(`'${argsString}' contains unbalanced parenthesis.`);
    }

    return result.args;
  }

  private updateRegex() {
    this.regex = new RegExp(`(${Object.keys(this.cssFunctions).join('|')})\\((.*)\\)`);
  }
}

function wrapWithValueProvider(fnToWrap: Function) {
  return (...args) => (tpaParams: ITPAParams) => fnToWrap(...args.map(fn => fn(tpaParams)), tpaParams);
}
