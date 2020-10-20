declare var define;

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.processedCssConfig = factory();
  }
})(this, function() {
  return {
    processedCssConfig: 'INJECTED_DATA_PLACEHOLDER',
  };
});
