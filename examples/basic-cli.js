import ipFilter from 'ip-filter';

import { yaro } from '../src/yaro/index.js';

// node ./examples/basic-cli.js --help

await yaro.run({
  name: 'foo-bar-cli',
  version: '0.1.0',
  commands: {
    _: (options) => {
      console.log('hello! options:', options);
      // testing with external error
      ipFilter('sasasasa');
    },
  },
});
