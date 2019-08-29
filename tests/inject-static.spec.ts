import * as path from 'path';
import {runWebpack} from './helpers/run-webpack';
import {clearDir} from './helpers/clear-dir';
import {AddAssetsPlugin} from './helpers/AddAssetsPlugin';

describe('Inject static styles', () => {
  const outputDirPath = path.resolve(__dirname, './output/inject-static');
  const entryName = 'app';
  let getStaticCss;

  beforeAll(async () => {
    await clearDir(outputDirPath);
    await runWebpack({
      output: {
        path: path.resolve(outputDirPath),
        libraryTarget: 'commonjs',
      },
      entry: {
        [entryName]: './tests/fixtures/runtime-entry.ts',
      },
      plugins: [
        new AddAssetsPlugin({
          filename: 'additional-style.css',
          src: `
          .index--root { background-color: "color(color-19)";
           .styleable-static {
  border: 1px solid #000;
}
}`,
        }),
      ],
    });
  });

  it('should contain all static CSS in Bundle file', async () => {
    const {getStaticCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    getStaticCss = realFunc;
    expect(getStaticCss()).toContain('.styleable-static');
    expect(getStaticCss()).toContain('.not-modify-static-params');
  });
});
