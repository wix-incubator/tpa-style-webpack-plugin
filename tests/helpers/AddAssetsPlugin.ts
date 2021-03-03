import webpack from 'webpack';
import {RawSource} from 'webpack-sources';

interface AddAssetsPluginOptions {
  src: string;
  filename: string;
}

export class AddAssetsPlugin implements webpack.Plugin {
  public static pluginName = 'add-assets-plugin';
  private readonly options: AddAssetsPluginOptions;

  constructor(options: AddAssetsPluginOptions) {
    this.options = options;
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(AddAssetsPlugin.pluginName, compilation => {
      compilation.hooks.additionalChunkAssets.tap(AddAssetsPlugin.pluginName, chunks => {
        chunks
          .filter(chunk => chunk.canBeInitial())
          .forEach(chunk => {
            const cssSources = this.options.src;
            const cssBundleFilename = compilation.getPath(this.options.filename, {chunk, hash: compilation.hash});
            compilation.assets[cssBundleFilename] = new RawSource(cssSources);
            chunk.files.push(cssBundleFilename);
          });
      });
    });
  }
}
