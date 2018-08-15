import * as path from 'path';

module.exports = function () {
};
module.exports.pitch = function () {
  this.cacheable && this.cacheable();

  const callback = this.async();
  const params = this.query.slice(1);

  const templatePath = path.join(__dirname, '../runtime/main.js');

  this.addDependency(templatePath);
  callback(null, `import {loader} from '${templatePath}';
  export const getProcessedCss = loader(${params});`);
};
