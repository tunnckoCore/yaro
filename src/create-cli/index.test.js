// SPDX-License-Identifier: MPL-2.0

import { strict as assert } from 'node:assert';
import { test } from 'bun:test';

import yaroCreateCli_, {
  rootWithMultipleCommands,
  UNNAMED_COMMAND_PREFIX,
  yaroCreateCli,
} from './index.js';

test('initial tests for yaro-parser package', async () => {
  assert.equal(typeof UNNAMED_COMMAND_PREFIX, 'string');
  assert.equal(typeof rootWithMultipleCommands, 'function');
  assert.equal(typeof yaroCreateCli, 'function');
  assert.equal(typeof yaroCreateCli_, 'function');
});
