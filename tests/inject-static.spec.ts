import * as path from 'path';
import {runWebpack} from './helpers/run-webpack';
import {clearDir} from './helpers/clear-dir';

describe('Inject static styles', () => {
  const outputDirPath = path.resolve(__dirname, './output/inject-static');
  const entryName = 'app';
  let stats, getStaticCss;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    stats = await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs',
      },
      entry: {
        [entryName]: './tests/fixtures/runtime-entry.ts',
      },
    });

    const {getStaticCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    getStaticCss = realFunc;
  });

  it('should have static CSS in Bundle file', () => {
    expect(getStaticCss()).toContain('.not-modify-static-params');
  });
});
