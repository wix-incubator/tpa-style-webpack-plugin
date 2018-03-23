import webpack from 'webpack';

export async function runWebpack(config) {
  config = Object.assign({}, config, {mode: 'development'});

  return new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) {
        return reject(err);
      }
      
      if (stats.compilation.errors.length > 0) {
        return reject(stats.compilation.errors[0]);
      }

      resolve(stats);
    });
  });
}