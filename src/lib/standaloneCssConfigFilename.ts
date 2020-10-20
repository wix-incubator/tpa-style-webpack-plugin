export function generateStandaloneCssConfigFilename(fileName: string) {
  const parts = fileName.split('.');

  const hasPart = (part: string) => parts.some(x => part === x);
  const index = [hasPart('js'), hasPart('min'), hasPart('bundle')].filter(x => x).length;

  return [...parts.slice(0, -index), 'cssConfig', ...parts.slice(-index)].join('.');
}
