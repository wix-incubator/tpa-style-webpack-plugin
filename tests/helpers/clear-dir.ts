import rimraf from 'rimraf';

export function clearDir(dir: string) {
  return new Promise<void>((resolve, reject) => {
    rimraf(dir, err => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}
