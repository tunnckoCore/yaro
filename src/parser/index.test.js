// SPDX-License-Identifier: MPL-2.0

import { strict as assert } from 'node:assert';
import { test } from 'asia';

import parse, { parser, yaroParser } from './index.js';

test('initial tests for yaro-parser package', async () => {
  assert.equal(typeof parse, 'function');
  assert.equal(typeof parser, 'function');
  assert.equal(typeof yaroParser, 'function');
});
