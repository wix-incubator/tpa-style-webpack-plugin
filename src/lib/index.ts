import webpackSources from 'webpack-sources';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import extractStyles from 'postcss-extract-styles';
import {extractTPACustomSyntax} from './postcssPlugin';
import prefixer from 'postcss-prefix-selector';
import {createHash} from 'crypto';
import webpack from 'webpack';
import {generateStandaloneCssConfigFilename} from './standaloneCssConfigFilename';

const isWebpack5 = parseInt(String(webpack.version), 10) === 5;

// use webpack's `webpack-sources` version, if it's v5, we'll get v2.0.0
const {RawSource, ReplaceSource} = isWebpack5 ? (webpack as any).sources : webpackSources;

interface PostCssExtractionResult {
  chunk: webpack.Chunk;
  cssVars: {[key: string]: string};
  customSyntaxStrs: string[];
  css: string;
  staticCss: string;
}

interface PostCssExtractionResultParams {
  cssVars?: PostCssExtractionResult['cssVars'];
  customSyntaxStrs?: PostCssExtractionResult['customSyntaxStrs'];
  css?: PostCssExtractionResult['css'];
  staticCss?: PostCssExtractionResult['staticCss'];
}

interface TPAStylePluginOptions {
  packageName: string;
  pattern?: RegExp[];
}

class TPAStylePlugin implements webpack.Plugin {
  public static pluginName = 'tpa-style-webpack-plugin';
  private readonly _options: TPAStylePluginOptions;
  private readonly compilationHash: string;

  constructor(options: TPAStylePluginOptions) {
    this._options = {
      pattern: [/"\w+\([^"]*\)"/, /START|END|DIR|STARTSIGN|ENDSIGN|DEG\-START|DEG\-END/],
      ...options,
    };
    const hash = this.getCompilationHash();
    this.compilationHash = `__${hash.substr(0, 6)}__`;
  }

  getCompilationHash() {
    if (isWebpack5) {
      return createHash('md5')
        .update(this._options.packageName)
        .digest('hex');
    }

    return createHash('md5')
      .update(new Date().getTime().toString())
      .digest('hex');
  }

  apply(compiler: webpack.Compiler) {
    const cheapModuleEvalSourceMap = isWebpack5 ? 'eval-cheap-module-source-map' : 'cheap-module-eval-source-map';
    const shouldEscapeContent = [cheapModuleEvalSourceMap, 'cheap-eval-source-map'].includes(
      compiler.options.devtool
    );
    this.replaceRuntimeModule(compiler);

    compiler.hooks.compilation.tap(TPAStylePlugin.pluginName, compilation => {
      const pluginDescriptor = isWebpack5
        ? {
            name: TPAStylePlugin.pluginName,
            stage: (compilation as any).PROCESS_ASSETS_STAGE_OPTIMIZE,
          }
        : TPAStylePlugin.pluginName;

      type OptimizeChunkAssets = webpack.compilation.Compilation['hooks']['optimizeChunkAssets'];

      const hook: OptimizeChunkAssets = isWebpack5
        ? (compilation.hooks as any).processAssets
        : compilation.hooks.optimizeChunkAssets;

      hook.tapAsync(pluginDescriptor, (chunks, callback) => {
        const actualChunks: webpack.Chunk[] = isWebpack5 ? compilation.chunks : chunks;

        this.extract(compilation, actualChunks)
          .then(extractResults => this.replaceSource(compilation, extractResults, shouldEscapeContent))
          .then(() => callback())
          .catch(callback);
      });
    });
  }

  private replaceRuntimeModule(compiler: webpack.Compiler) {
    const runtimePath = path.resolve(__dirname, '../../runtime.js');
    const nmrp = new webpack.NormalModuleReplacementPlugin(/runtime\.js$/, (resource: any) => {
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

  private extract(compilation: webpack.compilation.Compilation, chunks: webpack.Chunk[]) {
    const promises: Promise<PostCssExtractionResult>[] = [];

    chunks.forEach(chunk => {
      // webpack 5 turned this from an array to a set
      const files = isWebpack5 ? [...chunk.files] : chunk.files;

      promises.push(
        ...files
          .filter(fileName => fileName.endsWith('.css'))
          .map(cssFile =>
            postcss([extractStyles(this._options)])
              .use(prefixer({prefix: this.compilationHash, exclude: [/^\w+/]}))
              .process(compilation.assets[cssFile].source(), {from: cssFile, to: cssFile})
              // @ts-ignore
              .then((result: postcss.Result & {extracted: string}) => {
                compilation.assets[cssFile] = new RawSource(
                  result.css.replace(new RegExp(`${this.compilationHash} `, 'g'), '')
                );

                return new Promise<PostCssExtractionResult>(resolve => {
                  postcss([
                    prefixer({
                      prefix: this.compilationHash,
                    }),
                    extractTPACustomSyntax({
                      onFinish: ({cssVars, customSyntaxStrs, css}) => {
                        resolve({chunk, cssVars, customSyntaxStrs, css, staticCss: result.css});
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

  private getPlaceholderContent(params: PostCssExtractionResultParams, shouldEscapeContent: boolean) {
    const content = JSON.stringify(params);

    if (!shouldEscapeContent) {
      return content;
    }

    const escapedContent = JSON.stringify(content);
    return escapedContent.substring(1, escapedContent.length - 1);
  }

  private replaceByPlaceHolder({
    sourceCode,
    newSource,
    shouldEscapeContent,
    placeholder,
    params,
  }: {
    sourceCode: string;
    newSource: webpackSources.ReplaceSource;
    shouldEscapeContent: boolean;
    placeholder: 'INJECTED_DATA_PLACEHOLDER' | 'INJECTED_STATIC_DATA_PLACEHOLDER';
    params: PostCssExtractionResultParams;
  }) {
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

  private generateStandaloneCssConfig({
    shouldEscapeContent,
    params,
  }: {
    shouldEscapeContent: boolean;
    params: PostCssExtractionResultParams;
  }) {
    const sourceCode = fs.readFileSync(path.join(__dirname, './cssConfigTemplate.js')).toString();

    return new RawSource(
      sourceCode.replace(`'CSS_CONFIG_PLACEHOLDER'`, this.getPlaceholderContent(params, shouldEscapeContent))
    );
  }

  private replaceSource(
    compilation: webpack.compilation.Compilation,
    extractResults: PostCssExtractionResult[],
    shouldEscapeContent: boolean
  ) {
    const entryMergedChunks = this.getEntryMergedChunks(extractResults);

    entryMergedChunks.forEach(({chunk, cssVars, customSyntaxStrs, css, staticCss}) => {
      // webpack 5 turned this from an array to a set
      const files: string[] = isWebpack5 ? [...chunk.files] : chunk.files;

      files
        .filter(fileName => fileName.endsWith('.js'))
        .forEach(file => {
          const sourceCode: string = compilation.assets[file].source();
          const newSource: webpackSources.ReplaceSource = new ReplaceSource(compilation.assets[file], file);

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

          const params = {
            cssVars,
            customSyntaxStrs,
            css,
            staticCss,
            compilationHash: this.compilationHash,
          };

          compilation.assets[cssConfigFilename] = this.generateStandaloneCssConfig({
            shouldEscapeContent,
            params,
          });

          compilation.assets[file] = newSource;
        });
    });
  }

  private getEntryMergedChunks(extractResults: PostCssExtractionResult[]) {
    const entryMergedChunks = extractResults
      .filter(({chunk}) => chunk.canBeInitial())
      .reduce((chunkMap, currentResult) => {
        const currentChunk = currentResult.chunk;
        const currentChunkId = (currentChunk.id as unknown) as string;

        if (chunkMap.hasOwnProperty(currentChunkId)) {
          chunkMap[currentChunkId] = this.mergeExtractResults(chunkMap[currentChunkId], currentResult);
        } else {
          chunkMap[currentChunkId] = currentResult;
        }
        return chunkMap;
      }, {} as {[key: number]: PostCssExtractionResult});

    return Object.keys(entryMergedChunks).map(key => entryMergedChunks[key]) as PostCssExtractionResult[];
  }

  private mergeExtractResults(extractResult1: PostCssExtractionResult, extractResult2: PostCssExtractionResult) {
    const newResult = {...extractResult1};

    newResult.cssVars = {...newResult.cssVars, ...extractResult2.cssVars};
    newResult.customSyntaxStrs = newResult.customSyntaxStrs.concat(extractResult2.customSyntaxStrs);
    newResult.css += `\n${extractResult2.css}`;
    newResult.staticCss += `\n${extractResult2.staticCss}`;

    return newResult;
  }
}

export default TPAStylePlugin;
