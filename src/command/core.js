// SPDX-License-Identifier: MPL-2.0

/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable no-param-reassign */

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

      return {
        required: match[0].startsWith('<'),
        name: value,
        variadic,
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

  function createActionMethod(cli, _cfg) {
    return (handler) => {
      if (!cli.fn && typeof handler !== 'function') {
        throw new TypeError('cli do not have action handler function');
      }

      const commandHandler = cli.fn || handler;

      cli.name = removeBrackets(cli.usage);
      cli.args = findAllBrackets(cli.usage);
      cli.parts = cli.name.split(' ');
      cli.usage = cli.usage.slice(cli.name.length).trim();

      if (cli.name.length === 0) {
        unnamedCommandsCount += 1;
        cli.name = String(UNNAMED_COMMAND_PREFIX + unnamedCommandsCount);
      }

      commandAction.isYaroCommand = true;
      commandAction.cli = cli;
      commandHandler.isYaroCommand = true;
      commandHandler.cli = cli;

      return commandAction;

      async function commandAction(parsedFlags, ...argz) {
        const argv = pipeline(
          // run parser only if when we are given process.argv array
          Array.isArray(parsedFlags) && parser(),
          aliases(cli.meta.aliases), // aliases always first
          defaults(cli.meta.defaults, cli.meta.aliases),
          // todo: buggy, better use `required`? seems fixed.
          coerce(cli.meta.coerces), // casting should be before `required`
          required(cli.meta.required, cli.meta.aliases),
        )(parsedFlags);

        const { _: positionals, ...flags } = argv;

        // if we are passed another arguments,
        // then this is called manually by the user
        // so it will be passed the needed/correct arguments
        // otherwise it is called by a runner/cli
        if (argz.length > 0) {
          return commandHandler.call(null, flags, ...argz);
        }

        const actionArguments = [];
        for (const [index, argument] of cli.args.entries()) {
          const value = argument.variadic ? positionals.slice(index) : positionals[index];

          if (argument.required && !value) {
            const cmdUsage = `${cli.name === '_' ? '' : cli.name} ${cli.usage}`.trim();
            const error = new Error(
              `missing required argument "${argument.name}" from "${cmdUsage}" command`,
            );
            error.cmdUsage = cmdUsage;
            throw error;
          }

          actionArguments.push(value);
        }

        return commandHandler.call(null, flags, ...actionArguments);
      }
    };
  }
};
