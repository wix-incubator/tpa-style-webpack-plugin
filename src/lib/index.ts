import {RawSource, ReplaceSource} from 'webpack-sources';
import * as path from 'path';
import * as postcss from 'postcss';
import * as extractStyles from 'postcss-extract-styles';
import {extractTPACustomSyntax} from './postcssPlugin';
import * as prefixer from 'postcss-prefix-selector';
import {Result} from 'postcss';
import {createHash} from 'crypto';
import * as webpack from 'webpack';
import {IExtractedResult} from '../runtime/types';
import {parseCustomSyntax} from './customSyntaxParser';
import {mergeEntryChunks} from './chunkUtils';

class TPAStylePlugin {
  public static pluginName = 'tpa-style-webpack-plugin';
  private readonly _options;
  private readonly compilationHash: string;

  constructor(options) {
    this._options = {
      pattern: [/"\w+\([^"]*\)"/, /START|END|DIR|STARTSIGN|ENDSIGN|DEG\-START|DEG\-END/],
      ...options,
    };
    const hash = createHash('md5')
      .update(new Date().getTime().toString())
      .digest('hex');
    this.compilationHash = `__${hash.substr(0, 6)}__`;
  }

  apply(compiler) {
    const shouldEscapeContent = ['cheap-module-eval-source-map', 'cheap-eval-source-map'].includes(
      compiler.options.devtool
    );
    this.replaceRuntimeModule(compiler);

    compiler.hooks.compilation.tap(TPAStylePlugin.pluginName, compilation => {
      compilation.hooks.optimizeChunkAssets.tapAsync(TPAStylePlugin.pluginName, (chunks, callback) => {
        this.extract(compilation, chunks)
          .then(mergeEntryChunks)
          .then(parseCustomSyntax)
          .then(extractResults => this.replaceSource(compilation, extractResults, shouldEscapeContent))
          .then(() => callback())
          .catch(callback);
      });
    });
  }

  private replaceRuntimeModule(compiler) {
    const runtimePath = path.resolve(__dirname, '../../runtime.js');
    const nmrp = new webpack.NormalModuleReplacementPlugin(/runtime\.js$/, resource => {
      if (resource.resource !== runtimePath) {
        return;
      }

      const dirname = path.dirname(resource.resource);
      resource.request = './dist/runtime/main.js';
      resource.resource = path.join(dirname, 'dist/runtime/main.js');

      resource.loaders.push({
        loader: path.join(__dirname, 'runtimeLoader.js'),
        options: JSON.stringify({compilationHash: this.compilationHash}),
      });
    });
    nmrp.apply(compiler);
  }

  private extract(compilation, chunks): Promise<IExtractedResult[]> {
    const promises = [];

    chunks.forEach(chunk => {
      promises.push(
        ...chunk.files
          .filter(fileName => fileName.endsWith('.css'))
          .map(cssFile =>
            postcss([extractStyles(this._options)])
              .process(compilation.assets[cssFile].source(), {from: cssFile, to: cssFile})
              .then((result: Result & {extracted: string}) => {
                compilation.assets[cssFile] = new RawSource(result.css);

                return new Promise(resolve => {
                  postcss([
                    prefixer({
                      prefix: this.compilationHash,
                    }),
                    extractTPACustomSyntax({
                      onFinish: ({cssVars, customSyntaxStrs, css}) => {
                        resolve({chunk, cssVars, customSyntaxStrs, css});
                      },
                    }),
                  ]).process(result.extracted, {from: undefined}).css;
                });
              })
          )
      );
    });

    return Promise.all(promises);
  }

  private replaceSource(compilation, extractResults, shouldEscapeContent) {
    extractResults.forEach(({chunk, cssVars, customSyntaxStrs, css}) => {
      chunk.files
        .filter(fileName => fileName.endsWith('.js'))
        .forEach(file => {
          const sourceCode = compilation.assets[file].source();
          const placeHolder = `'${this.compilationHash}INJECTED_DATA_PLACEHOLDER'`;
          const placeHolderPos = sourceCode.indexOf(placeHolder);

          if (placeHolderPos > -1) {
            const newSource = new ReplaceSource(compilation.assets[file], file);

            const content = JSON.stringify({
              cssVars,
              customSyntaxStrs,
              css,
            });

            const escapedContent = JSON.stringify(content);

            newSource.replace(
              placeHolderPos,
              placeHolderPos + placeHolder.length - 1,
              shouldEscapeContent ? escapedContent.substring(1, escapedContent.length - 1) : content
            );
            compilation.assets[file] = newSource;
          }
        });
    });
  }
}

module.exports = TPAStylePlugin;
