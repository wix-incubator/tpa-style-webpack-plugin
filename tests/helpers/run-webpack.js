const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTPAStylePlugin = require('../../src');
const merge = require('webpack-merge');

const commonConfig = {
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ExtractTextPlugin.extract(['css-loader'])
    }]
  },
  plugins: [
    new ExtractTextPlugin('[name].styles.css'),
    new ExtractTPAStylePlugin(),
    new HtmlWebpackPlugin()
  ]
};

module.exports = async function runWebpack(config) {
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
};