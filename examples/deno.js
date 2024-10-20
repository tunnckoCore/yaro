// import ipFilter from 'ip-filter';

import { run, yaroCommand } from '../src/index.js';

// node ./examples/linter-cli.js --help

const lint = yaroCommand('[...files]', async (options, { files }) => {
  console.log('Linting files:', files);
  console.log('Options:', options);
  // testing with external error
  // ipFilter('sasasasa');
});

await run({
  name: 'foo-bar-cli',
  version: '2.1.6',
  commands: { lint },
});
