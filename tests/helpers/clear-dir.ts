import * as rimraf from 'rimraf';

export function clearDir(dir) {
  return new Promise((resolve, reject) => {
    rimraf(dir, err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}
