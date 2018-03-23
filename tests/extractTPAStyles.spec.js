import path from 'path';
import fs from 'mz/fs';
import webpack from 'webpack';

import ExtractTPAStylePlugin from '../src';

import {runWebpack} from './helpers/run-webpack';
import {clearDir} from './helpers/clear-dir';

describe('extractTPAStyles', () => {
  const dirPath = path.resolve(__dirname, './output/extractTPAStyles');

  beforeAll(async() => {
    await clearDir(dirPath);

  });

  afterAll(async() => {
    await clearDir(dirPath);
  });
});