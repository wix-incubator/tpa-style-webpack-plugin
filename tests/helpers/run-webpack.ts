const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTPAStylePlugin = require('../../dist/lib/index');
const merge = require('webpack-merge');

const getCommonConfig = (options) => ({
  output: {
    filename: '[name].bundle.js',
  },
  mode: 'development',
  devtool: 'none',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({filename: '[name].styles.css'}),
    new HtmlWebpackPlugin(),
    new ExtractTPAStylePlugin(options),
  ],
});

export async function runWebpack(originalConfig: any, tpaStylePluginOptions?: any) {
  const config = merge(getCommonConfig(tpaStylePluginOptions), originalConfig);

  return new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.compilation.errors.length > 0) {
        return reject(stats.compilation.errors[0]);
      }

      const files = stats.compilation.chunks.reduce((fileList, x) => fileList.concat(x.files), []);

      resolve(files);
    });
  });
}
