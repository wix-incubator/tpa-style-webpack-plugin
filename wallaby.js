module.exports = function () {

  return {
    files: ['src/lib/replacers.ts', 'src/runtime/**/*.ts', 'tests/**/*.ts', '!tests/**/*.spec.ts'],

    tests: ['tests/units/**/*.spec.ts'],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest'
  };
};
