import proc from 'node:process';
import { rootWithMultipleCommands, yaro } from '../src/index.js';
import * as exampleCommands from './some-commands.js';

const hela = yaro
  .command('', 'Software development and management.')
  .option('--cwd', 'Current working directory', proc.cwd())
  .option('-c, --config', 'Path to config file', 'hela.config.js')
  .option('--bar', 'Some random flag here', true)
  .action(rootWithMultipleCommands);

const one = yaro.command('one <a> [b]', 'Some command here').action((options) => {
  console.log('command: one!!', options);
});

const foo = yaro
  // .command('foo <patterns=> [outdir=dist]')
  .command('foo <...patterns>')
  .option('-q, --qux', 'Some quxie here')
  // flags includes global ones too and their defaults
  .action((flags, { patterns, outdir }, commandMeta) => {
    console.log('foo with patterns', { flags, patterns, outdir, commandMeta });
  });

// foo({}, { patterns: 'bar' });

await yaro.run({
  commands: { ...exampleCommands, one, foo },
  rootCommand: hela,
  name: 'hela',
  version: '6.0.0',
  showHelpOnEmpty: true,
});
