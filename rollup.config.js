import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/runtime/main.js',
  output: {
    file: 'runtime.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    babel({
      babelrc: false,
      presets: [['env', { modules: false }]],
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
};
