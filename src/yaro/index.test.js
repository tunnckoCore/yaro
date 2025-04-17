// SPDX-License-Identifier: MPL-2.0

import { strict as assert } from 'node:assert';
import { test } from 'asia';

import {
  pluginList,
  plugins,
  run,
  UNNAMED_COMMAND_PREFIX,
  yaroCommand,
  yaroCreateCli,
  yaroParser,
} from './index.js';

test('initial tests for yaro-parser package', async () => {
  assert.equal(typeof run, 'function');
  assert.equal(typeof yaroParser, 'function');
  assert.equal(typeof yaroCommand, 'function');
  assert.equal(typeof yaroCreateCli, 'function');
  assert.equal(UNNAMED_COMMAND_PREFIX, '___UNNAMED_COMMAND-');
  assert.equal(Array.isArray(pluginList), true);
  assert.equal(typeof plugins.defaults, 'function');
  assert.equal(typeof plugins.defaults({}), 'function');
  assert.equal(typeof plugins.required, 'function');
  assert.equal(typeof plugins.required({}), 'function');
  assert.equal(typeof plugins.coerce, 'function');
  assert.equal(typeof plugins.coerce({}), 'function');
  assert.equal(typeof plugins.alias, 'function');
  assert.equal(typeof plugins.alias({}), 'function');
});
