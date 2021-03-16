import path from 'path';
import {runWebpack} from './helpers/run-webpack';
import {clearDir} from './helpers/clear-dir';
import {AddAssetsPlugin} from './helpers/AddAssetsPlugin';
import {IGetStaticCssFn} from '../src/runtime/main';

describe('Inject static styles', () => {
  const outputDirPath = path.resolve(__dirname, './output/inject-static');
  const entryName = 'app';
  let getStaticCss: IGetStaticCssFn;

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

  beforeEach(() => {
    const {getStaticCss: realFunc} = require(path.join(outputDirPath, `${entryName}.bundle.js`));
    getStaticCss = realFunc;
  });

  it('should contain all static CSS in Bundle file', async () => {
    expect(getStaticCss()).toContain('.styleable-static');
    expect(getStaticCss()).toContain('.not-modify-static-params');
  });

  describe('with a prefix', () => {
    it('should scope static files', () => {
      const staticCss = getStaticCss({prefixSelector: '.prefix'});
      expect(staticCss).toContain('.prefix .styleable-static');
    });

    it('should not scope top level tags', () => {
      const staticCss = getStaticCss({prefixSelector: '.prefix'});
      expect(staticCss).toContain('html');
      expect(staticCss).not.toContain('.prefix html');
    });
  });
});
