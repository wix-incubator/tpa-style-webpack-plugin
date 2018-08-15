import {RawSource, ReplaceSource} from 'webpack-sources';
import * as path from 'path';
import * as postcss from 'postcss';
import * as extractStyles from 'postcss-extract-styles';
import {extractTPACustomSyntax} from './postcssPlugin';
import * as prefixer from 'postcss-prefix-selector';
import {Result} from 'postcss';
import {createHash} from 'crypto';

const fileSuffix = '.tpa.js';
const pluginName = 'tpa-style';

class TPAStylePlugin {
  private _options;
  private readonly prefixSelector: string;

  constructor(options) {
    this._options = Object.assign({
      pattern: [
        /"\w+\([^"]*\)"/,
        /START|END|DIR|STARTSIGN|ENDSIGN|DEG\-START|DEG\-END/
      ]
    }, options);
    const hash = createHash('md5').update(new Date().getTime().toString()).digest('hex');
    this.prefixSelector = `__${hash.substr(0, 6)}__`;
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
                    prefix: this.prefixSelector
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
            const placeHolder = '\'__INJECTED_DATA_PLACEHOLDER__\'';
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
    const runtimePath = path.resolve(__dirname, '../runtime/fake-main.js');

    compiler.hooks.normalModuleFactory.tap(pluginName, (nmf) => {
      nmf.hooks.afterResolve.tapAsync(pluginName, (result, callback) => {
        const resource = path.resolve(compiler.context, result.resource);

        if (resource !== runtimePath) {
          callback(null, result);
          return;
        }

        result.loaders.push({
          loader: path.join(__dirname, 'runtimeLoader.js'),
          options: JSON.stringify({prefixSelector: this.prefixSelector})
        });

        callback(null, result);
      });
    });

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(pluginName, (htmlPluginData, callback) => {
        const publicPath = (compiler.options.output.publicPath || '');

        Object.keys(compilation.assets)
          .filter((filename) => filename.endsWith(fileSuffix))
          .forEach((filename) => {
            htmlPluginData.head.push({
              tagName: 'script',
              closeTag: true,
              attributes: {
                type: 'text/javascript',
                src: path.join(publicPath, filename)
              }
            });
          });

        callback(null, htmlPluginData);
      });

      compilation.hooks.optimizeChunkAssets.tapAsync(pluginName, (chunks, callback) => {
        this.extract(compilation, chunks)
          .then((extractResults) => this.replaceSource(compilation, extractResults))
          .then(() => callback())
          .catch(callback);
      });
    });
  }
}

module.exports = TPAStylePlugin;
