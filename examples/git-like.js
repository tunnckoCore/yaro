import { yaro, yaroCommand } from '../src/index.js';

// node ./examples/git-like.js --help

// `commit` is just an async function
// NOTE: arguments are passed as second param to the handler, as named params
const commit = yaroCommand('commit [...msg]', async (_options, { msg }) => {
  console.log('git commit -sS', JSON.stringify(msg.flat().join(' ')));
});

// `add` is just an async function
const add = yaroCommand('add [...files]', 'git add files')
  .option('-A, --all', 'add all files', true)
  .action(async (_options, { files }) => {
    console.log('git add files:', files);
  });

// `remoteAdd` is just an async function
// NOTE: optional arguments can have default values
const remoteAdd = yaroCommand('remote add [foo] [bar=qux]')
  .option('-f, --force', 'some option here')
  .option('--dry-run', 'Call without running', false)
  .action(async (_options, { foo, bar }, commandMeta) => {
    console.log('adding remote %s -> %s', foo, bar, { commandMeta });
  });

// git remote rm foo
// git remote del foo
// git remote remove foo
// git rerm foo
const remoteDelete = yaroCommand('remote rm <name>')
  .alias('remote del', 'remote remove', 'rerm')
  .option('--dry-run', 'Call without running', false)
  .action(async (options, { name }) => {
    console.log('git remote rm', name);

    if (!options.foo) {
      throw new Error('some fake random error, try passing --foo');
    }
    console.log('okkkk! foo is passed');
  });

await yaro.run({
  name: 'git-cli',
  version: '3.1.1',
  showHelpOnEmpty: true,
  commands: {
    add,
    remoteAdd,
    remoteDelete,
    commit,
  },
});
