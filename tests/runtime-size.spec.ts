import * as path from 'path';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';

describe('runtime size', () => {
  const outputDirPath = path.resolve(__dirname, './output/runtime-size');
  const entryName = 'app';

  beforeAll(async () => {
    await clearDir(outputDirPath);
  });

  it('should throw when lib size exceeds 26kb', () => {
    return runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs',
      },
      performance: {
        maxEntrypointSize: 26 * 1024,
        hints: 'error',
      },
      mode: 'production',
      entry: {
        [entryName]: './runtime.js',
      },
    });
  });
});
