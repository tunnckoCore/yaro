// SPDX-License-Identifier: MPL-2.0

import { strict as assert } from 'node:assert';
import { test } from 'bun:test';

import { pipeline, pluginList, plugins } from './index.js';

test('initial tests for yaro-plugins package', async () => {
  assert.equal(typeof pipeline, 'function');
  assert.equal(
    typeof pipeline(
      () => {},
      () => {},
    ),
    'function',
  );

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
