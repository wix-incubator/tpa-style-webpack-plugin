module.exports = function(content: string) {
  // @ts-ignore
  this.cacheable && this.cacheable();

  // @ts-ignore
  const params = JSON.parse(this.query.slice(1));

  content = content.replace(/__COMPILATION_HASH__/g, params.compilationHash);

  return content;
};
