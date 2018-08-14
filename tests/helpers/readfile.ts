/* global Promise */
const fs = require('fs');

export function readFile(...args) {
  return new Promise((resolve, reject) =>
    fs.readFile(...args, (err, payload) =>
      err ? reject(err) : resolve(payload)
    )
  );
}
