import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {uglify } from 'rollup-plugin-uglify';


export default {
  input: 'src/runtime/main.js',
  output: {
    file: 'dist/runtime.js',
    format: 'iife'
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs(),
    babel({
      babelrc: false,
      presets: [['env', {modules: false}], ['stage-3']],
      plugins: ['external-helpers']
    }),
    uglify()
  ]
};
