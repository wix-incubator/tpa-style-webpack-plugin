export function generateStandaloneCssConfigFilename(fileName: string) {
  return appendFileName(fileName, 'cssConfig');
}

export function getRelatedStyleParamsFileName(fileName: string) {
  /**
   * this is a file name convention with Yoshi Flow Editor
   * related:
   * https://github.com/wix-private/yoshi/blob/7fd08397f8fb744a6fcceb38defd5afb90e86ba8/packages/yoshi-flow-editor/src/wrappers/stylesParamsWrapping.ts#L18
   * https://github.com/wix-private/yoshi/blob/7fd08397f8fb744a6fcceb38defd5afb90e86ba8/packages/yoshi-flow-editor/src/wrappers/stylesParamsWrapping.ts#L27
   */
  return appendFileName(fileName, 'stylesParams');
}

function appendFileName(fileName: string, injectedString: 'cssConfig' | 'stylesParams') {
  const parts = fileName.split('.');

  const hasPart = (part: string) => parts.some((x) => part === x);
  const index = [hasPart('js'), hasPart('min'), hasPart('bundle')].filter((x) => x).length;

  return [...parts.slice(0, -index), injectedString, ...parts.slice(-index)].join('.');
}
