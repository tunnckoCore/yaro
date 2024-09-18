import { rootWithMultipleCommands, yaro } from '../src/index.js';
import * as exampleCommands from './some-commands.js';

const hela = yaro
  .command('', 'Software development and management.')
  .option('--cwd', 'Current working directory')
  .option('-c, --config', 'Path to config file', 'hela.config.js')
  .option('--foo', 'Some random flag here', true)
  .action(rootWithMultipleCommands);

const one = yaro.command('one <a> [b]', 'Some command here').action((options) => {
  console.log('command: one!!', options);
});

await yaro.run({
  commands: { ...exampleCommands, one },
  rootCommand: hela,
  name: 'hela',
  version: '6.0.0',
  showHelpOnEmpty: true,
});
