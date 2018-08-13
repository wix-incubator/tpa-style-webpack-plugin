import * as path from 'path';

module.exports = function () {
};
module.exports.pitch = function () {
  this.cacheable && this.cacheable();

  const callback = this.async();
  const templatePath = path.join(__dirname, './runtime/main.js');

  this.addDependency(templatePath);
  callback(null, `export * from '${templatePath}'`);
};
