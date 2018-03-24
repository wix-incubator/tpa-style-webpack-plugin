const path = require('path');
const fs = require('mz/fs');

const runWebpack = require('./helpers/run-webpack');
const clearDir = require('./helpers/clear-dir');

describe('coreּ', () => {
  const outputDirPath = path.resolve(__dirname, './output/core');
  const entryName = 'app';
  let stats,
  cssFile,
  tpaRuntimeFile;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    stats = await runWebpack({
      output: {
        path: path.resolve(outputDirPath)
      },
      entry: {
        [entryName]: './tests/fixtures/first-entry.js'
      }
    });

    cssFile = await fs.readFile(path.join(outputDirPath, `${entryName}.styles.css`), 'utf8');
    tpaRuntimeFile = await fs.readFile(path.join(outputDirPath, `${entryName}.styles.tpa.js`), 'utf8');
  });

  it('should extract out TPA styles from regular css', async() => {
    expect(cssFile).not.toContain('.only-tpa');
    expect(cssFile).not.toContain('START');
    expect(cssFile).not.toContain('END');
    expect(cssFile).not.toContain('DIR');
  });

  it('should contain tpa style', () => {
    expect(tpaRuntimeFile).toContain('.only-tpa');
    expect(tpaRuntimeFile).toContain('START');
    expect(tpaRuntimeFile).toContain('END');
    expect(tpaRuntimeFile).toContain('DIR');
  });

  it('should have runtime code to inject styles', () => {
    expect(tpaRuntimeFile).toContain('addStyles(');
  });

  it('should have the source file name', () => {
    expect(tpaRuntimeFile).toContain(`${entryName}.styles.css`);
  });

  it('should include all the css that were required from the entry', () => {
    expect(cssFile).toContain(`.second-styles`);
    expect(tpaRuntimeFile).toContain(`.second-styles`);
  });
});