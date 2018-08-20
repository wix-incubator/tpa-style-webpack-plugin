import {RawSource} from 'webpack-sources';

export class AddAssetsPlugin {
  public static pluginName = 'add-assets-plugin';
  private options;

  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(AddAssetsPlugin.pluginName, (compilation) => {
      compilation.hooks.additionalChunkAssets.tap(
        AddAssetsPlugin.pluginName,
        chunks => {
          chunks.filter((chunk) => chunk.canBeInitial())
            .forEach(chunk => {
              const cssSources = this.options.src;
              const cssBundleFilename = compilation.getPath(this.options.filename, {chunk, hash: compilation.hash});
              compilation.assets[cssBundleFilename] = new RawSource(cssSources);
              chunk.files.push(cssBundleFilename);
            });
        }
      );
    });
  }
}
