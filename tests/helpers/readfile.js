/* global Promise */
const fs = require('fs');

const readFile = (...args) =>
  new Promise((resolve, reject) =>
    fs.readFile(...args, (err, payload) =>
      err ? reject(err) : resolve(payload)
    )
  );

module.exports = readFile;
