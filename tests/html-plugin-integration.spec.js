const path = require('path');
const fs = require('mz/fs');

const runWebpack = require('./helpers/run-webpack');
const clearDir = require('./helpers/clear-dir');

describe('html-plugin-integration', () => {
  const outputDirPath = path.resolve(__dirname, './output/html-plugin-integration');
  const entryName = 'app';
  let stats,
    htmlFile;

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

    htmlFile = await fs.readFile(path.join(outputDirPath, `index.html`), 'utf8');
  });

  it('should should inject js tag for the runtime', async () => {
    expect(htmlFile).toContain(`<script type="text/javascript" src="${entryName}.styles.tpa.js"></script>`);
  });
});