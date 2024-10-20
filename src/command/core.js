// SPDX-License-Identifier: MPL-2.0

/* eslint-disable unicorn/consistent-function-scoping */

let unnamedCommandsCount = 0;

export default (yaroPlugins) => {
  const { pipeline, parser, defaults, aliases, coerce, required } = yaroPlugins;
  // import {
  //   pipeline,
  //   parser,
  //   defaults,
  //   aliases,
  //   coerce,
  //   required,
  // } from 'yaro-plugins';

  const UNNAMED_COMMAND_PREFIX = '___UNNAMED_COMMAND-';

  // exports
  return { UNNAMED_COMMAND_PREFIX, command };

  function command(usage, settings, action) {
    if (typeof usage === 'function') {
      action = usage;
      usage = '';
    }
    if (typeof usage !== 'string') {
      throw new TypeError('cli requires `usage` to be passed and be a string');
    }

    if (typeof settings === 'function') {
      action = settings;

      settings = {};
    }
    if (typeof settings === 'string') {
      settings = { desc: settings };
    }

    // validate args (required cannot have default values; optional ones can)
    findAllBrackets(usage);

    const cfg = { ...settings };
    const meta = {
      defaults: {},
      aliases: {},
      coerces: {},
      required: {},
      flags: {},
      ...cfg.meta,
    };
    const cli = {
      settings: cfg,
      usage,
      meta,
      aliases: [],
    };

    cli.alias = (...names) => {
      cli.aliases.push(...names.flat());
      return cli;
    };

    cli.option = createOptionMethod(cli, cfg);
    cli.action = createActionMethod(cli, cfg);

    if (typeof action === 'function') {
      return cli.action(action);
    }

    return cli;
  }

  function createOptionMethod(cli /* , settings */) {
    return (rawName, desc, config) => {
      const flag = createOption(rawName, desc, config);

      cli.meta.flags[flag.name] = flag;

      cli.meta.aliases = flag.aliases.reduce((accumulator, k) => {
        accumulator[k] =
          flag.aliases.length === 1 ? flag.aliases : flag.aliases.filter((x) => x !== k);

        return accumulator;
      }, cli.meta.aliases);

      cli.meta.defaults = flag.aliases.reduce((accumulator, k) => {
        accumulator[k] = flag.default;
        return accumulator;
      }, cli.meta.defaults);

      cli.meta.coerces = flag.aliases.reduce((accumulator, k) => {
        accumulator[k] = flag.type;
        return accumulator;
      }, cli.meta.coerces);

      cli.meta.required = flag.aliases.reduce((accumulator, k) => {
        accumulator[k] = flag.required;
        return accumulator;
      }, cli.meta.required);

      return cli;
    };
  }

  function createOption(rawName, desc, config) {
    let cfg = config;
    if (desc && typeof desc === 'object') {
      cfg = desc;

      desc = cfg.desc || cfg.description || '';
    }
    if (cfg !== null && typeof cfg !== 'object') {
      cfg = { default: cfg };
    }

    cfg = { ...cfg };

    const flag = {
      rawName,
      desc: desc || '',
      default: cfg.default,
      type: cfg.type,
    };

    const names = removeBrackets(rawName)
      .split(',')
      .reduce((accumulator, v) => {
        let name = v.trim();

        let index;

        // eslint-disable-next-line no-plusplus
        for (index = 0; index < name.length; index++) {
          if (name.codePointAt(index) !== 45) break; // "-"
        }

        if (index === 1) {
          name = name.slice(1);
          return accumulator.concat(name, camelcase(name));
        }

        if (name.slice(index, index + 3) === 'no-') {
          flag.negated = true;
          name = name.slice(index + 3);
        } else {
          name = name.slice(index);
        }

        return accumulator.concat(name, camelcase(name));
      }, [])
      .sort((a, b) => (a.length > b.length ? 1 : -1)); // Sort names

    // Use the longest name (last one) as actual option name
    flag.name = names.at(-1);
    flag.name = flag.name.includes('-') ? names.at(-2) : flag.name;
    flag.aliases = [...new Set(names)];

    if (flag.negated) {
      flag.default = true;
    }

    if (rawName.includes('<')) {
      flag.required = true;
    } else if (rawName.includes('[')) {
      flag.required = false;
    }

    flag.required = cfg.required ?? flag.required;

    return flag;
  }

  function removeBrackets(v) {
    return v.replace(/[<[].+/, '').trim();
  }

  function camelcase(input) {
    return input.replaceAll(/([a-z])-([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  }

  function findAllBrackets(v) {
    const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
    const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)]/g;

    const res = [];

    const parseMatch = (match) => {
      let variadic = false;
      let value = match[1];
      if (value.startsWith('...')) {
        value = value.slice(3);
        variadic = true;
      }

      const isRequired = match[0].startsWith('<');
      const hasDefault = value.includes('=');

      if (hasDefault && isRequired) {
        const error = new Error(`required arguments cannot have defaults: ${v}`);
        error.cmdUsage = v;

        throw error;
      }

      let defValue = null;
      if (hasDefault) {
        let val = value.split('=')[1];
        // eslint-disable-next-line prefer-template
        val = val.startsWith('[') ? val + ']' : val;
        val = val.startsWith('[') || val.startsWith('{') ? val : `"${val}"`;
        defValue = JSON.parse(val);
      }

      return {
        optional: !isRequired,
        required: isRequired,
        name: hasDefault ? value.split('=')[0] : value,
        variadic,
        ...(hasDefault ? { default: defValue } : {}),
      };
    };

    let angledMatch;
    // eslint-disable-next-line no-cond-assign
    while ((angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v))) {
      res.push(parseMatch(angledMatch));
    }

    let squareMatch;
    // eslint-disable-next-line no-cond-assign
    while ((squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v))) {
      res.push(parseMatch(squareMatch));
    }

    return res;
  }

  function createActionMethod(cmd, _cfg) {
    return (handler) => {
      if (!cmd.fn && typeof handler !== 'function') {
        throw new TypeError('cmd do not have action handler function');
      }

      const commandHandler = cmd.fn || handler;

      cmd.name = removeBrackets(cmd.usage);
      cmd.args = findAllBrackets(cmd.usage);
      cmd.parts = cmd.name.split(' ');
      cmd.usage = cmd.usage.slice(cmd.name.length).trim();

      if (cmd.name.length === 0) {
        unnamedCommandsCount += 1;
        cmd.name = String(UNNAMED_COMMAND_PREFIX + unnamedCommandsCount);
      }

      commandAction.isYaroCommand = true;
      commandAction.cli = cmd;
      commandAction.cmd = cmd;
      commandHandler.isYaroCommand = true;
      commandHandler.cli = cmd;
      commandHandler.cmd = cmd;

      return commandAction;

      async function commandAction(parsedFlags, args) {
        const argv = pipeline(
          // run parser only if when we are given process.argv array
          Array.isArray(parsedFlags) && parser(),
          aliases(cmd.meta.aliases), // aliases always first
          defaults(cmd.meta.defaults, cmd.meta.aliases),
          // todo: buggy, better use `required`? seems fixed.
          coerce(cmd.meta.coerces), // casting should be before `required`
          required(cmd.meta.required, cmd.meta.aliases),
        )(parsedFlags);

        const { _: positionals, ...flags } = argv;
        cmd.argv = argv;

        const cmdUsage = `${cmd.name === '_' ? '' : cmd.name} ${cmd.usage}`.trim();

        if (args && typeof args !== 'object') {
          const error = new Error(
            `Command "${cmdUsage}" expect second argument to be object when given`,
          );
          error.cmdUsage = cmdUsage;
          throw error;
        }

        const cmdArgs = cmd.args.map((x, idx) => ({
          ...x,
          value: x.variadic ? positionals.slice(idx) : positionals[idx],
        }));

        args = args || {};

        const manualCallArgs = Object.entries(args);
        const hasManualInput = manualCallArgs.length > 0;

        for (const arg of cmdArgs) {
          const isArr = Array.isArray(arg.value) && arg.value.length === 0;
          const isObj = typeof arg.value === 'object' && Object.keys(arg.value || {}).length === 0;

          const val =
            'default' in arg && (!arg.value || isArr || isObj)
              ? arg.default
              : hasManualInput
                ? args[arg.name]
                : arg.value;

          const isNotVal = hasManualInput ? !(arg.name in args) : !val;

          if (arg.required && isNotVal) {
            const error = new Error(
              `missing required argument "${arg.name}" from "${cmdUsage}" command`,
            );
            error.cmdUsage = cmdUsage;
            throw error;
          }

          args[arg.name] = val;
        }

        return commandHandler.call(null, flags, args, cmd);
      }
    };
  }
};
