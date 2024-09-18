// SPDX-License-Identifier: MPL-2.0

import { parser } from '../parser/index.js';
import { plugins, pipeline } from '../plugins/index.js';
import createMain from './core.js';

const { command } = createMain({ parser, pipeline, ...plugins });
const yaroCommand = command;

export { command, yaroCommand };
export default command;
