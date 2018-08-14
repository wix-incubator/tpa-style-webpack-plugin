const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTPAStylePlugin = require('../../dist/src');
const merge = require('webpack-merge');

const commonConfig = {
  output: {
    filename: '[name].bundle.js'
  },
  mode: 'development',
  devtool: 'none',
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader
        },
        {
          loader: 'css-loader'
        }]
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({filename: '[name].styles.css'}),
    new HtmlWebpackPlugin(),
    new ExtractTPAStylePlugin()
  ]
};

export async function runWebpack(config) {
  config = merge(config, commonConfig);

  return new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.compilation.errors.length > 0) {
        return reject(stats.compilation.errors[0]);
      }

      const files = stats.compilation.chunks.reduce((files, x) => files.concat(x.files), []);

      resolve(files);
    });
  });
}
