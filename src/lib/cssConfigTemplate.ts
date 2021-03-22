declare var define;

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.cssConfig = factory();
  }
})(this, function () {
  return {
    cssConfig: 'CSS_CONFIG_PLACEHOLDER',
  };
});
