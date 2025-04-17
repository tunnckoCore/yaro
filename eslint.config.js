// export { default } from 'eslint-config-xaxa';

import config from 'eslint-config-xaxa';

export default [
  ...config,
  {
    rules: {
      'no-param-reassign': 'off',
      'no-use-before-define': 'off',
      'no-underscore-dangle': 'off',
    },
  },
];
