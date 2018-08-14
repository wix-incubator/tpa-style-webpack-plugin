import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';
import {readFile} from './helpers/readfile';

describe.only('runtime', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime');
  const entryName = 'app';
  let stats,
    cssFile,
    tpaRuntimeFile;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    stats = await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs'
      },
      entry: {
        [entryName]: './tests/fixtures/runtime-entry.js'
      }
    });

    cssFile = await readFile(path.join(outputDirPath, `${entryName}.styles.css`), 'utf8');
    const {getProcessedCss} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    console.log(getProcessedCss);
  });

  it.only('should append style tag', () => {
  });
});
