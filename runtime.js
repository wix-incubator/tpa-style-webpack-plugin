// The following code is compiled `export * from './dist/runtime/fakeMain';` in order to support commonjs

const fakeMain = require('./dist/runtime/fakeMain');
Object.keys(fakeMain).forEach(key => {
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return fakeMain[key];
    }
  });
});
