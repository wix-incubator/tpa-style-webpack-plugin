var WixService = /** @class */ (function () {
  function WixService(Wix) {
    this.Wix = Wix;
  }
  WixService.prototype.getStyleParams = function () {
    return this.shouldRunAsStandalone() ?
      Promise.resolve([{}, {}, {}]) :
      Promise.all([
        promisfy(this.Wix.Styles.getSiteColors),
        promisfy(this.Wix.Styles.getSiteTextPresets),
        promisfy(this.Wix.Styles.getStyleParams)
      ]);
  };
  WixService.prototype.listenToStyleParamsChange = function (cb) {
    this.Wix.addEventListener(this.Wix.Events.STYLE_PARAMS_CHANGE, cb);
  };
  WixService.prototype.listenToSettingsUpdated = function (cb) {
    this.Wix.addEventListener(this.Wix.Events.SETTINGS_UPDATED, cb);
  };
  WixService.prototype.isEditorMode = function () {
    return this.Wix.Utils.getViewMode() === 'editor';
  };
  WixService.prototype.isPreviewMode = function () {
    return this.Wix.Utils.getViewMode() === 'preview';
  };
  WixService.prototype.isStandaloneMode = function () {
    return this.Wix.Utils.getViewMode() === 'standalone';
  };
  WixService.prototype.shouldRunAsStandalone = function () {
    return this.isStandaloneMode() || this.withoutStyleCapabilites();
  };
  WixService.prototype.withoutStyleCapabilites = function () {
    return !this.Wix.Styles;
  };
  return WixService;
}());
function promisfy(fn) {
  return new Promise(function (resolve, reject) { return fn(function (res) { return res ? resolve(res) : reject({}); }); });
}
