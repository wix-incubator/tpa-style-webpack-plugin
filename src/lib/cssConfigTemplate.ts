declare var define: {(arg0: never[], arg1: () => {cssConfig: string}): void; amd: any};

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    // @ts-ignore
    root.cssConfig = factory();
  }
})(this, function() {
  return {
    cssConfig: 'CSS_CONFIG_PLACEHOLDER',
  };
});
