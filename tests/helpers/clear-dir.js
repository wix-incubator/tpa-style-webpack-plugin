const rimraf = require('rimraf');

module.exports = function clearDir(dir) {
  return new Promise((resolve, reject) => {
    rimraf(dir, err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};