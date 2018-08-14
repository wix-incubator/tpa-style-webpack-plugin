export class CustomSyntaxHelper {
  private vars = {};
  public customSyntaxStrs = [];

  public setVars(vars: { [key: string]: string }) {
    this.vars = {...vars};
  }
  public setCustomSyntax(customSyntax: string[]) {
    this.customSyntaxStrs = [...customSyntax];
  }
  public getValue(varName: string) {
    return this.vars[varName];
  }
}
