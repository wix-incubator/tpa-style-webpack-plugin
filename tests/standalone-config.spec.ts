import * as path from 'path';
import * as fs from 'fs';
import {clearDir} from './helpers/clear-dir';
import {runWebpack} from './helpers/run-webpack';

describe('StandaloneConfig', () => {
  const entryName = 'app';

  describe('Bundle using getProcessedCss', () => {
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
          [entryName]: './tests/fixtures/runtime-entry.ts',
        },
      });

      cssConfigPath = path.join(outputDirPath, `${entryName}.bundle.processedCssConfig.js`);
    });

    it('should generate css config for bundles using getProcessedCss', () => {
      expect(fs.existsSync(cssConfigPath)).toBe(true);
    });
  });

  describe('Bundle not using dynamic css', () => {
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
          [entryName]: './tests/fixtures/without-dynamic-css.ts',
        },
      });

      cssConfigPath = path.join(outputDirPath, `${entryName}.bundle.processedCssConfig.js`);
    });

    it('should not generate css config for bundles not using getProcessedCss', () => {
      expect(fs.existsSync(cssConfigPath)).toBe(false);
    });
  });

  //TODO: Add support in the plugin for dynamically loaded bundles.
  describe.skip('Bundle using dynamically loaded getProcessedCss', () => {
    const outputDirPath = path.resolve(__dirname, './output/standalone-config-dynamic-import');
    let cssConfigPath: string;

    beforeAll(async () => {
      await clearDir(outputDirPath);
      await runWebpack({
        output: {
          path: path.resolve(outputDirPath),
          libraryTarget: 'commonjs',
        },
        entry: {
          [entryName]: './tests/fixtures/with-dynamic-getProcessedCss.ts',
        },
      });

      cssConfigPath = path.join(outputDirPath, `${entryName}.bundle.processedCssConfig.js`);
    });

    it('should generate css config for files using dynamic getProcessedCss', () => {
      expect(fs.existsSync(cssConfigPath)).toBe(true);
    });
  });
});
