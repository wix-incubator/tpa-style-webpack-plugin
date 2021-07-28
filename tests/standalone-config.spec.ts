import path from 'path';
import fs from 'fs';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';

describe('StandaloneConfig', () => {
  const entryName = 'app';

  describe('Bundle using css', () => {
    const outputDirPath = path.resolve(__dirname, './output/standalone-config');
    let cssConfigPath: string;

    beforeAll(async () => {
      await clearDir(outputDirPath);
      await runWebpack({
        output: {
          path: path.resolve(outputDirPath),
          libraryTarget: 'commonjs',
        },
        entry: {
          [entryName]: './tests/fixtures/with-css.ts',
        },
      });

      cssConfigPath = path.join(outputDirPath, `${entryName}.cssConfig.bundle.js`);
    });

    it('should generate css config for bundles using css', () => {
      expect(fs.existsSync(cssConfigPath)).toBe(true);
    });

    it('should generate staticCssHash in css config for bundles using css', () => {
      const {cssConfig} = require(cssConfigPath);
      expect(cssConfig.staticCssHash).toBeTruthy();
    });
  });

  describe('Bundle not using css', () => {
    const outputDirPath = path.resolve(__dirname, './output/standalone-config-no-dynamic-css');
    let cssConfigPath: string;

    beforeAll(async () => {
      await clearDir(outputDirPath);
      await runWebpack({
        output: {
          path: path.resolve(outputDirPath),
          libraryTarget: 'commonjs',
        },
        entry: {
          [entryName]: './tests/fixtures/without-css.ts',
        },
      });

      cssConfigPath = path.join(outputDirPath, `${entryName}.cssConfig.bundle.js`);
    });

    it('should not generate css config for bundles not using css', () => {
      expect(fs.existsSync(cssConfigPath)).toBe(false);
    });
  });
});
