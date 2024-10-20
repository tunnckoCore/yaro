import { isRequiredUtil as isRequired, yaroCommand } from './src/index.js';

export const basicfn = function initCmd() {
  console.log('some basic fn');
};

export const affected = yaroCommand(
  '[...names]',
  'List affected workspaces of change in `name` package',
)
  .alias('innit', 'intit')
  .alias('aff', 'affcted', 'affecetd')
  .option('--raw', 'Print raw-only output', { type: Boolean, default: false })
  .option(
    '-p, --packages',
    'Print affected package names, instead of workspaces (which is default)',
    { type: Boolean, default: false },
  )
  .option('--workspace-file', 'File path to write workspaces metadata', {
    default: 'hela-workspace.json',
    // type: String,
    required: isRequired,
    // normalize: true,
  })
  .action(async (options, { names }) => {
    console.log('affected command', { options, names });
  });

export const ensCreate = yaroCommand(
  'ens create <foo> [...names=["foo", "bar"]]',
  // 'ens create <foo> [bar={"qux":123,"zaz":"ok"}]',
  // 'ens create <foo> [bar=some default]',
  'Resolve workspaces and packages information',
)
  .alias('ens cr', 'enscr', 'ens craet', 'ens creaate', 'ens creat', 'ens:cr', 'ens:new')
  .option('-f, --foo-bar', 'File path to write workspaces metadata')
  .option('--dry-run', 'Run the command without writing new versions to disk', {
    type: Boolean,
    default: false,
  })
  .action(async (options, { foo, bar, names }) => {
    // throw new Error('fake err');
    console.log('run affected command from init command', { foo, bar, names });
    await affected(options, { foo, bar, names });
  });

// export const ens = command('ens <command>', async (options, cmd, ...args) => {
//   await ensCreate(options, ...args);
// });

export const lint = yaroCommand('gaga [...files]', async (options, { files }) => {
  console.log('gaga: formatting and linting files', { options, files });
});

export const xaxa = yaroCommand((options) => {
  console.log('lint command without usage definition', { options });
});

export const fmt = async (options) => {
  console.log('basic format command, just a simple function style definition');
  console.log('options:', options);
  await xaxa(options);
};

export const foobie = async (_options) => {
  console.log('foobie command calls `fmt` (bare function) command');

  throw new Error('fake err');
};
