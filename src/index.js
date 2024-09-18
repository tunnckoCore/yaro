// SPDX-License-Identifier: MPL-2.0

import proc from 'node:process';

import { yaroCommand } from './command/index.js';
import { yaroCreateCli } from './create-cli/index.js';
import { yaroParser } from './parser/index.js';

// import yaroBuildOutput from 'yaro-build-output'

export * from './command/index.js';
export * from './create-cli/index.js';
export * from './plugins/index.js';
export * from './parser/index.js';

export async function run(config) {
  if (Array.isArray(config)) {
    throw new TypeError(
      'yaro: You are trying to use `createCli` which accepts a `config` object. The `yaroCreateCli` accepts an array as the first argument.',
    );
  }

  return yaroCreateCli(proc.argv.slice(2), {
    ...config,
    exit: proc.exit,
    yaroParser,
    yaroCommand,
    // buildOutput: yaroBuildOutput,
  });
}

run.yaroCommand = yaroCommand;
run.command = yaroCommand;
run.yaroParser = yaroParser;
run.parser = yaroParser;
run.run = run;

export default run;
export const yaro = run;
