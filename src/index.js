const OriginalSource = require('webpack-sources').OriginalSource;
const RawSource = require('webpack-sources').RawSource;
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
            .process(compilation.assets[cssFile].source(), { from: cssFile, to: cssFile })
            .then((result) => {
              compilation.assets[cssFile] = new RawSource(result.css);

              return postcss([extractTPACustomSyntax({
                onFinish: ({ cssVars, customSyntaxStrs }) => {
                  const extractedFilename = cssFile.replace('.css', fileSuffix);
                  const newChunk = new Chunk(extractedFilename);
                  newChunk.files = [extractedFilename];
                  newChunk.ids = [];
                  compilation.chunks.push(newChunk);

                  const extractedStyles = generateRuntime({
                    css: result.extracted,
                    filename: cssFile,
                    cssVars,
                    customSyntaxStrs
                  });
                  compilation.assets[extractedFilename] = new OriginalSource(extractedStyles);
                }
              })])
                .process(result.extracted, { from: undefined });
            }))
      );
    });

    return Promise.all(promises);
  }

  apply(compiler) {
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
          .then(() => callback())
          .catch(callback);
      });
    });
  }
}

module.exports = ExtractTPAStylePlugin;
