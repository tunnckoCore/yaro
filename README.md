# yaro v6

> A companion to Hela. Fast, minimalist, pluggable and functional command line parsing. Create CLIs
> easily. A wrapper package exporting everything from several Yaro packages. Creating CLI programs,
> easily. Deno support and ESM-only default. Similar to CAC, Yargs, and Sade, because there are
> different problems and viewpoints.

## Highlights

- Familiar and small APIs.
- Built from the ground up, for N-th time.
- Used in production for years.
- Stable & robust
- Single Command Mode support.
- Built-in help output & version.
- Checking for option's value.
- Missing required arguments checking.
- Sane defaults, option's value type checking too.
- Veriadic and positional arguments.
- Familiar & intuitive sub-commands support.
- Dot-notation, camelCase options, and other goodies.
- ESM-only (& node >=20) & Deno support (`'https://esm.sh/yaro@6/src/index.js'`).
- Total composition - every command built is just a function on steroids!

More docs and better help output - soon!

But it's pretty straightforward:

- yaroCommand(rawName) => cli
- cli.option(rawName, desc, config = {})
- cli.alias(...aliases)
- cli.version(versionString)
- cli.action(async (flags, ...args) => {})
- cli.describe(desc) - add description to **a command!** Useful for single command mode.

**Example**

Making a git-like cli:

```js
import { yaro, yaroCommand } from 'yaro';

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
  .action(async (_options, { foo, bar }) => {
    console.log('adding remote %s -> %s', foo, bar);
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
  commands: {
    add,
    remoteAdd,
    remoteDelete,
    commit,
  },
});
```

### Single Command Mode

We are detecting by default if you pass just one `yaroCommand` to the `commands` object of
`yaro.run`.

You can try this example with `node examples/linter-cli.js foo bar qux`

```js
import proc from 'node:process';

import { run, isRequiredUtil, yaroCommand } from 'yaro';

// or Deno
// import { yaroCommand } from 'https://esm.sh/yaro@6'
const xaxa = yaroCommand(
  '[foo] [...files]',
  'Lint and format files with ESLint --fix and Prettier.',
)
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
    console.log('flags/options', flags);
    console.log('files passed', files);
    console.log('arguments', args);

    // await lint(files, flags);
  });

console.log({ xaxa });
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

// or import yaro, and call `yaro.run`
await run({
  commands: { xaxa },
  version: '3.2.1',
  name: 'xaxa-cli',
});
```
