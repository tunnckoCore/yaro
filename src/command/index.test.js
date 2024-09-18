// SPDX-License-Identifier: MPL-2.0

import { strict as assert } from 'node:assert';
  import { test } from 'bun:test';

import cmd, { command, yaroCommand } from './index.js';

test('initial tests for yaro-parser package', async () => {
  assert.equal(typeof cmd, 'function');
  assert.equal(typeof command, 'function');
  assert.equal(typeof yaroCommand, 'function');
});
