import {generateStandaloneCssConfigFilename} from '../../src/lib/standaloneCssConfigFilename';

describe('standaloneCssConfigFilename', () => {
  it('should support simple js files', () => {
    expect(generateStandaloneCssConfigFilename('some.file.js')).toEqual('some.file.cssConfig.js');
  });

  it('should support simple minified files', () => {
    expect(generateStandaloneCssConfigFilename('some.file.min.js')).toEqual('some.file.cssConfig.min.js');
  });

  it('should support yoshi editor flow bundle files', () => {
    expect(generateStandaloneCssConfigFilename('some.file.bundle.js')).toEqual('some.file.cssConfig.bundle.js');
  });

  it('should support yoshi editor flow bundle minified files', () => {
    expect(generateStandaloneCssConfigFilename('some.file.bundle.min.js')).toEqual('some.file.cssConfig.bundle.min.js');
  });
});
