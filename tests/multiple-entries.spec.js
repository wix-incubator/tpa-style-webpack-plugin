const path = require('path');
const fs = require('mz/fs');

const runWebpack = require('./helpers/run-webpack');
const clearDir = require('./helpers/clear-dir');

describe('multiple-entries', () => {
  const outputDirPath = path.resolve(__dirname, './output/multiple-entries');
  const entryName1 = 'app';
  const entryName2 = 'app1';
  let stats,
  cssFile1,
  tpaRuntimeFile1,
  cssFile2,
  tpaRuntimeFile2;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    stats = await runWebpack({
      output: {
        path: path.resolve(outputDirPath)
      },
      entry: {
        [entryName1]: './tests/fixtures/first-entry.js',
        [entryName2]: './tests/fixtures/second-entry.js'
      }
    });

    cssFile1 = await fs.readFile(path.join(outputDirPath, `${entryName1}.styles.css`), 'utf8');
    tpaRuntimeFile1 = await fs.readFile(path.join(outputDirPath, `${entryName1}.styles.tpa.js`), 'utf8');
    cssFile2 = await fs.readFile(path.join(outputDirPath, `${entryName2}.styles.css`), 'utf8');
    tpaRuntimeFile2 = await fs.readFile(path.join(outputDirPath, `${entryName2}.styles.tpa.js`), 'utf8');
  });

  it('should generate 2 css files without tpa styles', async() => {
    [cssFile1, cssFile2].forEach((file) => {
      expect(file).not.toContain('.only-tpa');
      expect(file).not.toContain('START');
      expect(file).not.toContain('END');
      expect(file).not.toContain('DIR');
    });
  });

  it('should have the source file name', () => {
    expect(tpaRuntimeFile1).toContain(`${entryName1}.styles.css`);
    expect(tpaRuntimeFile2).toContain(`${entryName2}.styles.css`);
  });
});