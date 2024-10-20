import proc from 'node:process';

// import prettyConfig from '@tunnckocore/pretty-config';

import { rootWithMultipleCommands, yaro } from '../src/index.js';

// import * as exampleCommands from './some-commands.js';

const hela = yaro
  .command('', 'Software development and management.')
  .option('--cwd', 'Current working directory', proc.cwd())
  .option('-c, --config', 'Path to config file', 'hela.config.js')
  .option('--populate-env', 'Populate env from process.env', true)
  .action(rootWithMultipleCommands);

// const one = yaro.command('one <a> [b]', 'Some command here').action((options, { a, b }) => {
//   console.log('command: one!!', options, { a, b });
// });

// const foo = yaro
//   // .command('foo <patterns=> [outdir=dist]')
//   .command('foo <...patterns>')
//   .option('-q, --qux', 'Some quxie here')
//   // flags includes global ones too and their defaults
//   .action((flags, { patterns }, commandMeta) => {
//     console.log('foo with patterns', { flags, patterns, commandMeta });
//   });

// foo({}, { patterns: 'bar' });

const cfg = await import('../hela-demo.config.mjs');
const cmds =
  (typeof cfg.default === 'function' ? await cfg.default() : (cfg?.default ?? cfg)) || {};

const commands = Object.fromEntries(
  Object.entries(cmds).map(([key, valueCmdFn]) => {
    const isUnnamed = valueCmdFn.cli?.name?.includes('UNNAMED');
    valueCmdFn.key = isUnnamed ? key : valueCmdFn.cli?.name || key;

    if (isUnnamed) {
      valueCmdFn.cli.name = valueCmdFn.key;
      valueCmdFn.cmd.name = valueCmdFn.key;
    }

    return [key, valueCmdFn];
  }),
);

// console.log('commandscommandscommands', commands);

await yaro.run({
  commands,
  // commands: { ...exampleCommands, one, foo },
  rootCommand: hela,
  name: 'hela',
  version: '6.0.0',
  showHelpOnEmpty: true,
});
