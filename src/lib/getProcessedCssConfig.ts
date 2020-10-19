declare var define;

(function(global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports);
  } else {
    // tslint:disable-next-line
    var mod = {
      exports: {},
    };
    factory(mod.exports);
    global.log = mod.exports;
  }
})(this, function(exports) {
  'use strict';

  exports.getProcessedCssConfig = 'INJECTED_DATA_PLACEHOLDER';
});
