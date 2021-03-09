import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import merge from 'webpack-merge';
const ExtractTPAStylePlugin = require('../../dist/lib/index');

const commonConfig: webpack.Configuration = {
  output: {
    filename: '[name].bundle.js',
  },
  mode: 'development',
  //@ts-ignore
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
    new ExtractTPAStylePlugin({packageName: 'test'}),
  ],
};

export async function runWebpack(originalConfig: webpack.Configuration) {
  const config = merge(commonConfig, originalConfig);

  return new Promise<string[]>((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.compilation.errors.length > 0) {
        return reject(stats.compilation.errors[0]);
      }

      const files = stats.compilation.chunks.reduce<string[]>((fileList, x) => fileList.concat(x.files), []);

      resolve(files);
    });
  });
}
