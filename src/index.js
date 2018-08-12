const OriginalSource = require('webpack-sources').OriginalSource;
const RawSource = require('webpack-sources').RawSource;
const ReplaceSource = require('webpack-sources').ReplaceSource;
const path = require('path');
const Chunk = require('webpack/lib/Chunk');
const postcss = require('postcss');
const extractStyles = require('postcss-extract-styles');
const extractTPACustomSyntax = require('./postcss-plugin');
const generateRuntime = require('./runtimeGenerator');

const fileSuffix = '.tpa.js';
const pluginName = 'extract-tpa-style';

class ExtractTPAStylePlugin {
  constructor(options) {
    this._options = Object.assign({
      pattern: [
        /"\w+\(.+\)"/,
        /START|END|DIR|STARTSIGN|ENDSIGN|DEG\-START|DEG\-END/
      ]
    }, options);
  }

  extract(compilation, chunks) {
    const promises = [];

    chunks.forEach((chunk) => {
      promises.push(
        chunk.files
          .filter(fileName => fileName.endsWith('.css'))
          .map(cssFile => postcss([extractStyles(this._options)])
            .process(compilation.assets[cssFile].source(), {from: cssFile, to: cssFile})
            .then((result) => {
              compilation.assets[cssFile] = new RawSource(result.css);

              return postcss([extractTPACustomSyntax({
                onFinish: ({cssVars, customSyntaxStrs}) => {
                  const extractedFilename = cssFile.replace('.css', fileSuffix);
                  const newChunk = new Chunk(extractedFilename);
                  newChunk.files = [extractedFilename];
                  newChunk.ids = [];
                  compilation.chunks.push(newChunk);

                  const generatedRuntime = generateRuntime({
                    css: result.extracted,
                    filename: cssFile,
                    cssVars,
                    customSyntaxStrs
                  });
                  compilation.assets[extractedFilename] = new OriginalSource(generatedRuntime);
                }
              })])
                .process(result.extracted, {from: undefined});
            }))
      );
    });

    return Promise.all(promises);
  }

  apply(compiler) {
    const runtimePath = path.resolve(__dirname, '../runtime.js');

    compiler.hooks.normalModuleFactory.tap(pluginName, (nmf) => {
      nmf.hooks.afterResolve.tapAsync(pluginName, (result, callback) => {
        const resource = path.resolve(compiler.context, result.resource);

        if (resource !== runtimePath) {
          callback(null, result);
          return;
        }

        result.loaders.push({
          loader: path.join(__dirname, 'runtime-loader.js')
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
          .then(() => this.replaceSource(compilation, chunks))
          .then(() => callback())
          .catch(callback);
      });
    });
  }

  replaceSource(compilation, chunks) {
    for (const chunk of chunks) {
      if (!chunk.canBeInitial()) {
        continue;
      }

      for (const file of chunk.files) {
        // console.log('compilation.assets[file]', compilation.assets[file].source());
        // console.log('file', file);
        const newSource = new ReplaceSource(
          compilation.assets[file],
          file
        );
        const sourceCode = compilation.assets[file].source();
        const placeHolder = '__CSS_PLACEHOLDER__';
        const placeHolderPos = sourceCode.indexOf(placeHolder);

        if (placeHolderPos > -1) {
          newSource.replace(placeHolderPos, placeHolderPos + placeHolder.length - 1, 'OUR MAGIC CSS');
          compilation.assets[file] = newSource;
        }
      }
    }
  }
}

module.exports = ExtractTPAStylePlugin;
