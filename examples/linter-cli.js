import proc from 'node:process';

// yaro.command is alias of yaroCommand named exported
// yaro.parser is alias of yaroParser named exported
// yaro.run is alias of the default exported function run() wihch is just thin wrapper around yaroCreateCli
// yaro() is also an alias of yaro.run and yaroCreateCli - do not use it to define commands

import { isRequiredUtil, yaro } from '../src/index.js';

// or Deno;
// import { yaroCommand } from 'https://esm.sh/yaro@6'

const xaxa = yaro
  .command('[...files]', 'Lint and format files with ESLint --fix and Prettier.')
  .option('--cwd', 'Working directory, defaults to `process.cwd()`.', proc.cwd())
  .option('--log', 'Log per changed file', false)
  .option('-f, --force', 'Force lint, cleaning the cache.', false)
  .option('-c, --config', 'Path to config file.', {
    default: 'xaxa.config.js',
    required: isRequiredUtil,
  })
  .option('--workspace-file', 'File path to write workspaces metadata.', {
    default: 'hela-workspace.json',
    required: isRequiredUtil,
    // type: 'string',
    // normalize: true,
  })
  .option('--verbose', 'Print more verbose output.', false)
  .action(async (flags, { files }) => {
    console.log('hhi from action');
    console.log('flags/options', flags);
    console.log('files passed', files);
    // console.log('arguments', args);

    // await lint(files, flags);
  });

// console.log(xaxa);
// => {
//   xaxa: [AsyncFunction: commandAction] {
//     isYaroCommand: true,
//     cli: {
//       settings: [Object],
//       usage: '[foo] [...files]',
//       meta: [Object],
//       aliases: [],
//       alias: [Function (anonymous)],
//       option: [Function (anonymous)],
//       action: [Function (anonymous)],
//       name: '___UNNAMED_COMMAND-1',
//       args: [Array],
//       parts: [Array]
//     }
//   }
// }

await yaro.run({
  commands: { xaxa },
  version: '3.2.1',
  name: 'xaxa-cli',
});
