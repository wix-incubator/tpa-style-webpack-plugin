import {RawSource, ReplaceSource} from 'webpack-sources';
import * as path from 'path';
import * as postcss from 'postcss';
import * as extractStyles from 'postcss-extract-styles';
import {extractTPACustomSyntax} from './postcssPlugin';
import * as prefixer from 'postcss-prefix-selector';
import {Result} from 'postcss';
import {createHash} from 'crypto';
import * as webpack from 'webpack';

const pluginName = 'tpa-style-webpack-plugin';

class TPAStylePlugin {
  private _options;
  private readonly compilationHash: string;

  constructor(options) {
    this._options = Object.assign({
      pattern: [
        /"\w+\([^"]*\)"/,
        /START|END|DIR|STARTSIGN|ENDSIGN|DEG\-START|DEG\-END/
      ]
    }, options);
    const hash = createHash('md5').update(new Date().getTime().toString()).digest('hex');
    this.compilationHash = `__${hash.substr(0, 6)}__`;
  }

  extract(compilation, chunks) {
    const promises = [];

    chunks.forEach((chunk) => {
      promises.push(
        ...chunk.files
          .filter(fileName => fileName.endsWith('.css'))
          .map(cssFile => postcss([extractStyles(this._options)])
            .process(compilation.assets[cssFile].source(), {from: cssFile, to: cssFile})
            .then((result: Result & { extracted: string }) => {
              compilation.assets[cssFile] = new RawSource(result.css);

              return new Promise((resolve) => {
                postcss([
                  prefixer({
                    prefix: this.compilationHash
                  }),
                  extractTPACustomSyntax({
                    onFinish: ({cssVars, customSyntaxStrs, css}) => {
                      resolve({chunk, cssVars, customSyntaxStrs, css});
                    }
                  })])
                  .process(result.extracted, {from: undefined}).css;
              });
            }))
      );
    });

    return Promise.all(promises);
  }

  replaceSource(compilation, extractResults) {
    extractResults.filter(({chunk}) => chunk.canBeInitial())
      .forEach(({chunk, cssVars, customSyntaxStrs, css}) => {
        chunk.files.filter(fileName => fileName.endsWith('.js'))
          .forEach(file => {
            const sourceCode = compilation.assets[file].source();
            const placeHolder = `'${this.compilationHash}INJECTED_DATA_PLACEHOLDER'`;
            const placeHolderPos = sourceCode.indexOf(placeHolder);

            if (placeHolderPos > -1) {
              const newSource = new ReplaceSource(
                compilation.assets[file],
                file
              );

              newSource.replace(
                placeHolderPos,
                placeHolderPos + placeHolder.length - 1,
                JSON.stringify({
                  cssVars,
                  customSyntaxStrs,
                  css
                })
              );
              compilation.assets[file] = newSource;
            }
          });
      });
  }

  apply(compiler) {
    this.replaceRuntimeModule(compiler);

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapAsync(pluginName, (chunks, callback) => {
        this.extract(compilation, chunks)
          .then((extractResults) => this.replaceSource(compilation, extractResults))
          .then(() => callback())
          .catch(callback);
      });
    });
  }

  private replaceRuntimeModule(compiler) {
    const nmrp = new webpack.NormalModuleReplacementPlugin(/tpa\-style\-webpack\-plugin\/runtime\.js$/, (resource) => {
      resource.request = './dist/runtime/main.js';
      resource.userRequest = resource.userRequest.replace('runtime.js', 'dist/runtime/main.js');
      resource.rawRequest = resource.rawRequest.replace('runtime.js', 'dist/runtime/main.js');
      resource.resource = resource.resource.replace('runtime.js', 'dist/runtime/main.js');

      resource.loaders.push({
        loader: path.join(__dirname, 'runtimeLoader.js'),
        options: JSON.stringify({compilationHash: this.compilationHash})
      });
    });
    nmrp.apply(compiler);
  }
}

module.exports = TPAStylePlugin;
