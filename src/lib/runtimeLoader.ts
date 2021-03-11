module.exports = function(content) {
  this.cacheable && this.cacheable();
  const params = JSON.parse(this.query.slice(1));
  content = content.replace(/__COMPILATION_HASH__/g, params.compilationHash);
  return content;
};
