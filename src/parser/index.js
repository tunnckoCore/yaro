// SPDX-License-Identifier: MPL-2.0

/*
  node ./example.js git remote add ens \
    --zaz -vvv -wwHw -f -p ho --snake=bar --some-flag --foo-bar ok \
    --no-barry -xyz --no-bars --foo --joo GG HH JJ --bar \
    --koo=AA BB CC -q EE RR WW -k=1 one two too --qux -c xaxa.config.js \
    -a='-b 123' -u '-d12' -l '"-v13"' -o='-r7at' -r 'qux zaz' \
    -e '--roo sa3re' --tar '-v ./some folder/and.js' \
    --includes a.js,boo.js,qux.js --azzy oh --includes sasa.js,ok.js \
    --includes=ab,ce,dd -- cmd --verbose --dry-run --no-show-stack
 */

export const yaroParser = parser;
export { parser };

export default function parser(argv, config) {
  const res = { _: [] };
  if (!argv) {
    return res;
  }
  if (!Array.isArray(argv)) {
    throw new TypeError('expects `argv` to be an array');
  }
  const options = {
    array: {},
    autoCount: true,
    camelCase: false,
    ...config,
  };
  const camelcase = options.camelCase ?? options.camelcase;

  let argument;
  let previous = {};
  let doubleDashIndex;
  let isShort;
  let isLong;
  let isValue;
  let isNo;
  let isNegate;
  let key;
  let index;

  const firstFlagIndex = argv.findIndex((x) => x[0] === '-');
  let arguments_ = [];

  if (firstFlagIndex === 0) {
    arguments_ = argv;
  } else if (firstFlagIndex > 0) {
    arguments_ = argv.slice(firstFlagIndex);
    res._.push(...argv.slice(0, firstFlagIndex));
  } else if (firstFlagIndex === -1) {
    arguments_ = [];
    res._ = argv;
    return res;
  }

  // eslint-disable-next-line no-plusplus
  for (index = 0; index < arguments_.length; index++) {
    argument = arguments_[index];
    const argumentLength = argument.length;
    doubleDashIndex = argument[0] === '-' && argument[1] === '-';

    if (argumentLength === 2 && doubleDashIndex) {
      doubleDashIndex = index;
      break;
    }

    isShort = argumentLength > 1 && argument[0] === '-' && argument[1] !== '-';
    isLong = argumentLength > 2 && doubleDashIndex;

    isValue = !isShort && !isLong;
    isNo = argument[2] === 'n' && argument[3] === 'o' && argument[4] === '-';
    isNegate = isLong && isNo;
    key = null;

    if (isNegate) {
      key = argument.slice(5);
    } else if (isLong) {
      key = argument.slice(2);
    } else if (isShort) {
      key = argument.slice(1);
    }

    const equalsIndex = key?.indexOf('=') || 0;
    const usesEquals = equalsIndex > 0; // -f=a, --foo=bar
    const temporary = key;
    key = usesEquals ? key.slice(0, equalsIndex) : key;

    let value = null;

    if (isNegate) {
      value = false;
    } else if ((isShort || isLong) && !isValue) {
      value = usesEquals ? temporary.slice(equalsIndex + 1) : true;
    } else if (isValue) {
      value = argument;
    }

    // key will be null if it's a value,
    // so we should get the previous flag's key
    if (key && key.indexOf(' ') >= 1) {
      value = argument;

      const kkk = previous.key;
      key = kkk;
      isValue = true;
    } else {
      key = key === null && isValue && previous.isFlag === true ? previous.key : key;
    }

    if (key && !isValue && camelcase && isLong && key.indexOf('-') > 0) {
      key = key.replaceAll(/([a-z])-([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
    }

    const shouldAppendOne = key === null && isValue && previous.isFlag === false;
    const shouldAppenTwo = isValue && previous.isFlag && previous.value !== true;
    const shouldAppend = shouldAppendOne || shouldAppenTwo;

    if (shouldAppend) {
      const kkk = previous.key;
      key = kkk;
      value = `${previous.value} ${value}`;
    }

    previous = { isFlag: !isValue, key, value };

    if (options.array[key] && !(key in res)) {
      res[key] = value === true ? [] : [value];
    } else if (options.array[key] && key in res) {
      res[key] = value === true ? res[key] : res[key].concat(value);
    } else if (key !== null) {
      if (isShort && key.length > 1 && !isValue && !usesEquals) {
        for (const ch of key) {
          // if it exists we should try to check if it's `true` bare (no value)
          // or if it has value. if it is true, we make it 2 (number) cuz that's the 2nd occurance
          if (options.autoCount && ch in res) {
            res[ch] = res[ch] === true ? 2 : res[ch] + 1;
          } else {
            res[ch] = true;
          }
        }
      } else {
        res[key] = value;
      }
    }
  }

  if (typeof doubleDashIndex === 'number') {
    res['--'] = arguments_.slice(doubleDashIndex + 1);
  }

  return { ...res };
}
