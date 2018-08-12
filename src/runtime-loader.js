const path = require('path');
const fs = require('fs');

module.exports = function () {
};
module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  this.cacheable && this.cacheable();

  const callback = this.async();
  // const params = JSON.parse(this.query.slice(1));
  const templatePath = path.join(__dirname, './runtime/main.js');

  this.addDependency(templatePath);
  callback(null, `module.exports = require('${templatePath}')`);
};
