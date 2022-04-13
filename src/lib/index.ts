import webpackSources from 'webpack-sources';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import {extractStylesPlugin} from './postcssExtractStyles';
import {extractTPACustomSyntax} from './postcssPlugin';
import prefixer from 'postcss-prefix-selector';
import {Result} from 'postcss';
import {createHash} from 'crypto';
import webpack from 'webpack';
import {generateStandaloneCssConfigFilename, getRelatedStyleParamsFileName} from './standaloneCssConfigFilename';

const isWebpack5 = parseInt(webpack.version, 10) === 5;

// use webpack's `webpack-sources` version, if it's v5, we'll get v2.0.0
const {RawSource, ReplaceSource} = isWebpack5 ? (webpack as any).sources : webpackSources;

interface Options {
  pattern: RegExp;
  jsChunkPattern: RegExp;
  cssChunkPattern: RegExp;
  packageName?: string;
}
class TPAStylePlugin {
  public static pluginName = 'tpa-style-webpack-plugin';
  private readonly _options: Options;
  private readonly compilationHash: string;

  constructor(options) {
    this._options = {
      pattern: [/"\w+\([^"]*\)"/, /START|END|DIR|STARTSIGN|ENDSIGN|DEG\-START|DEG\-END/],
      jsChunkPattern: /\.js$/,
      cssChunkPattern: /\.css$/,
      ...options,
    };
    const hash = this.getCompilationHash();
    this.compilationHash = `__${hash.substr(0, 6)}__`;
  }

  getCompilationHash() {
    if (isWebpack5 || this._options.packageName) {
      return createHash('md5')
        .update(this._options.packageName)
        .digest('hex');
    }

    return createHash('md5')
      .update(new Date().getTime().toString())
      .digest('hex');
  }

  apply(compiler) {
    const cheapModuleEvalSourceMap = isWebpack5 ? 'eval-cheap-module-source-map' : 'cheap-module-eval-source-map';
    const shouldEscapeContent = [cheapModuleEvalSourceMap, 'cheap-eval-source-map'].includes(compiler.options.devtool);
    this.replaceRuntimeModule(compiler);

    compiler.hooks.compilation.tap(TPAStylePlugin.pluginName, compilation => {
      const pluginDescriptor = isWebpack5
        ? {
            name: TPAStylePlugin.pluginName,
            stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
          }
        : TPAStylePlugin.pluginName;

      const hook = isWebpack5 ? compilation.hooks.processAssets : compilation.hooks.optimizeChunkAssets;

      hook.tapAsync(pluginDescriptor, (chunks, callback) => {
        const actualChunks = isWebpack5 ? compilation.chunks : chunks;

        this.extract(compilation, actualChunks)
          .then(extractResults => this.replaceSource(compilation, extractResults, shouldEscapeContent))
          .then(() => callback())
          .catch(callback);
      });
    });
  }

  private replaceRuntimeModule(compiler) {
    const runtimePath = path.resolve(__dirname, '../../runtime.js');
    const nmrp = new webpack.NormalModuleReplacementPlugin(/runtime\.js$/, resource => {
      if (isWebpack5) {
        // `resource`, `request`, and `loaders` are exposed under `createData`
        // in webpack v5
        resource = resource.createData;
      }

      if (fs.realpathSync(resource.resource) !== runtimePath) {
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

  private extract(compilation, chunks) {
    const promises = [];

    chunks.forEach(chunk => {
      // webpack 5 turned this from an array to a set
      const files = isWebpack5 ? [...chunk.files] : chunk.files;

      promises.push(
        ...files
          .filter(fileName => this._options.cssChunkPattern.test(fileName))
          .map(cssFile =>
            postcss([extractStylesPlugin(this._options)])
              .use(prefixer({prefix: this.compilationHash, exclude: [/^\w+/]}))
              .process(compilation.assets[cssFile].source(), {from: cssFile, to: cssFile})
              .then((result: Result) => {
                compilation.assets[cssFile] = new RawSource(
                  result.css.replace(new RegExp(`${this.compilationHash} `, 'g'), '')
                );

                const {extracted} = result.messages.find(m => m.plugin === 'postcss-extract-styles');

                return new Promise(resolve => {
                  postcss([
                    prefixer({
                      prefix: this.compilationHash,
                    }),
                    extractTPACustomSyntax({
                      onFinish: ({cssVars, customSyntaxStrs, css}) => {
                        resolve({chunk, cssVars, customSyntaxStrs, css, staticCss: result.css});
                      },
                    }),
                  ]).process(extracted, {from: undefined}).css;
                });
              })
          )
      );
    });

    return Promise.all(promises);
  }

  private getPlaceholderContent(params: Record<string, string>, shouldEscapeContent: boolean) {
    if ('staticCss' in params) {
      params.staticCssHash = createHash('sha1')
        .update(params.staticCss)
        .digest('base64');
    }

    const content = JSON.stringify(params);

    if (!shouldEscapeContent) {
      return content;
    }

    const escapedContent = JSON.stringify(content);
    return escapedContent.substring(1, escapedContent.length - 1);
  }

  private getStyleParamsDefaultsContent(assets: any, fileName: string) {
    const styleParamsFileName = getRelatedStyleParamsFileName(fileName);
    const styleParamsFile = assets[styleParamsFileName];

    if (styleParamsFile) {
      return `(function () {
        var styleParamsModule = {};
        var styleParamsExports = {};

        (function (module, exports) {
          ${styleParamsFile.source()}
        })(styleParamsModule, styleParamsExports);

        return styleParamsModule.exports && styleParamsModule.exports.default ? styleParamsModule.exports.default : null;  
      })()`;
    }

    return null;
  }

  private replaceByPlaceHolder({sourceCode, newSource, shouldEscapeContent, placeholder, params}) {
    const placeHolder = `'${this.compilationHash}${placeholder}'`;
    const placeHolderPos = sourceCode.indexOf(placeHolder);

    if (placeHolderPos > -1) {
      newSource.replace(
        placeHolderPos,
        placeHolderPos + placeHolder.length - 1,
        this.getPlaceholderContent(params, shouldEscapeContent)
      );
    }
  }

  private generateStandaloneCssConfig({shouldEscapeContent, params, defaults}) {
    const sourceCode = fs.readFileSync(path.join(__dirname, './cssConfigTemplate.js')).toString();

    return new RawSource(
      sourceCode
        .replace(`'CSS_CONFIG_PLACEHOLDER'`, this.getPlaceholderContent(params, shouldEscapeContent))
        .replace(`"STYLE_PARAMS_DEFAULTS_PLACEHOLDER"`, defaults)
    );
  }

  private replaceSource(compilation, extractResults, shouldEscapeContent) {
    const entryMergedChunks = this.getEntryMergedChunks(extractResults);

    entryMergedChunks.forEach(({chunk, cssVars, customSyntaxStrs, css, staticCss}) => {
      // webpack 5 turned this from an array to a set
      const files = isWebpack5 ? [...chunk.files] : chunk.files;

      files
        .filter(fileName => this._options.jsChunkPattern.test(fileName))
        .forEach(file => {
          const sourceCode = compilation.assets[file].source();
          const newSource = new ReplaceSource(compilation.assets[file], file);

          this.replaceByPlaceHolder({
            sourceCode,
            newSource,
            shouldEscapeContent,
            placeholder: 'INJECTED_DATA_PLACEHOLDER',
            params: {
              cssVars,
              customSyntaxStrs,
              css,
            },
          });

          this.replaceByPlaceHolder({
            sourceCode,
            newSource,
            shouldEscapeContent,
            placeholder: 'INJECTED_STATIC_DATA_PLACEHOLDER',
            params: {
              staticCss,
            },
          });

          const cssConfigFilename = generateStandaloneCssConfigFilename(file);
          const defaults = this.getStyleParamsDefaultsContent(compilation.assets, file);

          const params = {
            cssVars,
            customSyntaxStrs,
            css,
            staticCss,
            compilationHash: this.compilationHash,
            defaults: 'STYLE_PARAMS_DEFAULTS_PLACEHOLDER',
          };

          compilation.assets[cssConfigFilename] = this.generateStandaloneCssConfig({
            shouldEscapeContent,
            params,
            defaults,
          });

          compilation.assets[file] = newSource;
        });
    });
  }

  private getEntryMergedChunks(extractResults) {
    const entryMergedChunks = extractResults
      .filter(({chunk}) => chunk.canBeInitial())
      .reduce((chunkMap, currentResult) => {
        const currentChunk = currentResult.chunk;
        if (chunkMap.hasOwnProperty(currentChunk.id)) {
          chunkMap[currentChunk.id] = this.mergeExtractResults(chunkMap[currentChunk.id], currentResult);
        } else {
          chunkMap[currentChunk.id] = currentResult;
        }
        return chunkMap;
      }, {});

    return Object.keys(entryMergedChunks).map(key => entryMergedChunks[key]);
  }

  private mergeExtractResults(extractResult1, extractResult2) {
    const newResult = {...extractResult1};

    newResult.cssVars = {...newResult.cssVars, ...extractResult2.cssVars};
    newResult.customSyntaxStrs = newResult.customSyntaxStrs.concat(extractResult2.customSyntaxStrs);
    newResult.css += `\n${extractResult2.css}`;
    newResult.staticCss += `\n${extractResult2.staticCss}`;

    return newResult;
  }
}

module.exports = TPAStylePlugin;
