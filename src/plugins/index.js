// SPDX-License-Identifier: MPL-2.0

export function pipeline(...fns) {
  return function runPipeline(argv) {
    const last = fns.at(-1);
    const lastIsConfig = last && typeof last === 'object';
    const cfg = lastIsConfig ? { ...last } : {};
    let flags = null;

    const plgs = lastIsConfig ? fns.slice(0, -1) : fns;
    const hasParser = plgs.find((x) => x.name === 'yaroParserPlugin');
    const plugins = hasParser ? plgs : plgs.filter(Boolean);

    // if we do not have parser, we assume we are already passed parsed argv
    let result = hasParser ? {} : { _: [], ...argv };

    for (const [index, plugin] of plugins.entries()) {
      const returnValue = plugin(flags || argv, result, {
        config: cfg,
        argv,
        flags,
      });

      // first plugin is always the parser, it is passed argv array (process.argv),
      // and it returns the parsed arguments object (flags/options)
      // which will be passed to the next plugins
      if (index === 0 && hasParser) {
        flags = returnValue;
      }

      if (returnValue === false) {
        break;
      }

      result = { ...result, ...returnValue };
    }

    return result;
  };
}

export function defaultsPlugin(config, _aliases) {
  return (flags, result) => {
    const alis = { ..._aliases };
    const cfg = { ...config };
    const res = { ...result };

    for (const [name, value] of Object.entries(cfg)) {
      res[name] = flags[name] ?? res[name] ?? value;
      // const foo = res[name];

      const alibis = alis[name];

      for (const k of alibis) {
        res[k] = res[k] === res[name] ? res[k] : res[name];
        res[name] = res[k];
      }
    }

    return res;
  };
}

export const aliasesPlugin = aliasPlugin;
export function aliasPlugin(config, _defaults) {
  return (flags, result) => {
    const defs = { ..._defaults };
    const cfg = { ...config };
    const res = { ...result };

    for (const [name, _aliases] of Object.entries(cfg)) {
      res[name] = res[name] ?? defs[name] ?? flags[name];
      for (const k of _aliases) {
        res[k] = flags[name] ?? flags[k] ?? res[name];
        res[name] = res[k];
      }
    }

    return res;
  };
}

export function coercePlugin(config, _aliases) {
  return (flags, result) => {
    const alis = { ..._aliases };
    const cfg = { ...config };
    const res = { ...result };
    const keys = Object.keys(cfg).sort((a, b) => b.length - a.length);

    for (const k of keys) {
      const flagValue = res[k] ?? flags[k] ?? undefined;
      const function_ = typeof cfg[k] === 'function' ? cfg[k] : () => flagValue;

      res[k] = function_(flagValue);

      if (Number.isNaN(res[k])) {
        const names = namePairUtil(alis, k);
        throw new TypeError(`option "${names}" failed to be coerced correctly`);
      }
    }

    return res;
  };
}

export function requiredPlugin(config, _aliases) {
  return (flags, result) => {
    const alis = { ..._aliases };
    const res = { ...result };

    if (Array.isArray(config)) {
      for (const requiredFlagName of config) {
        const isDefined = res[requiredFlagName] !== undefined;

        if (!isDefined) {
          throw new Error(`required option "${requiredFlagName}" is required`);
        }
      }
    }
    if (config && typeof config === 'object') {
      for (const flagName of Object.keys(config)) {
        const flagValue = res[flagName];
        const valueType = typeof flagValue;
        let def = config[flagName];
        const isDefined = res[flagName] !== undefined;
        const isDifferent = res[flagName] !== flags[flagName];

        if (def === true && !isDefined) {
          throw new Error(`required option "${flagName}" is not passed`);
        }
        if (typeof def === 'string') {
          def = { type: def };
        }
        if (isDefined && def && def.type && valueType !== def.type) {
          throw new Error(
            `required option "${flagName}" expect value of type "${def.type}", but "${valueType}" given`,
          );
        }
        if (typeof def === 'function') {
          let returnValue = def({
            flagName,
            flagValue,
            isDefined,
            flagType: valueType,
            flag: res[flagName],
            passed: flags[flagName],
            isDifferent,
          });
          // console.log('zzzzz', ret);
          // note: temporary type casting for booleans
          if (typeof returnValue === 'function') {
            res[flagName] = returnValue(res[flagName]);
            returnValue = true;
          }
          if (returnValue !== true) {
            const names = namePairUtil(alis, flagName);
            throw new Error(`required option "${names}" failed validation`);
          }
        }
      }
    }

    return res;
  };
}

export function isRequiredUtil({ flagValue, isDefined, flagType }) {
  const value = Number(flagValue);

  return Number.isNaN(value) && typeof value === 'number' && isDefined && flagType === 'string';
}

export function namePairUtil(ali, k) {
  return [k, ali[k]]
    .flat()
    .filter(Boolean)
    .map((x) => (x.length === 1 ? `-${x}` : `--${x}`))
    .join(',');
}

export const pluginList = [aliasesPlugin, defaultsPlugin, coercePlugin, requiredPlugin];
export const plugins = {
  alias: aliasesPlugin,
  aliases: aliasesPlugin,
  defaults: defaultsPlugin,
  coerce: coercePlugin,
  required: requiredPlugin,
};
