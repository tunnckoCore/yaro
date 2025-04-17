// SPDX-License-Identifier: MPL-2.0

/* eslint-disable max-statements */

// Renamed _flags to flags (assuming it might be used or for clarity)
export function buildOutput(flags, meta, info) {
  if ((info.noCommandSpecified && meta.config.showHelpOnEmpty) || info.isHelp) {
    if (!info.matchedCommand && info.isHelp) {
      // Called renamed function updateHelpLine
      updateHelpLine(meta);
      console.log('\n$ %s [options]\n', meta.cliInfo.helpLine);
      showAvailableCommands(meta, console.log);
    } else if (info.isHelp) {
      console.log(
        '\n$ %s\n',
        `${meta.config.name} ${info.matchedCommand.key} ${info.matchedCommand.cli.usage}`,
      );

      console.log('Aliases:', info.matchedCommand.cli.aliases.join(', ').trim());

      console.log('Options:');
      for (const flag of Object.values(info.matchedCommand.cli.meta.flags)) {
        const def =
          'default' in flag && flag.default !== undefined ? `(default: ${flag.default})` : '';
        console.log('  %s   %s %s', flag.rawName, flag.desc, def);
      }
      console.log('');
    }

    meta.config.exit(info.exitCode ?? 0);
    return;
  }

  if (info.commandNotFound) {
    const args = meta.argv._.join(' ');
    console.error('ERR_COMMAND_NOT_FOUND: command "%s" not found', args);
    // Called renamed function updateHelpLine
    updateHelpLine(meta);
    console.error('\n$ %s [options]\n', meta.cliInfo.helpLine);

    showAvailableCommands(meta, console.error);
    meta.config.exit(1);
    return;
  }

  const { error } = info;
  const has = /MATCHED_COMMAND_FAIL|ROOT_COMMAND_FAIL/.test(error?.code || '');

  if (error && has && !error.cmdUsage) {
    const isRootFailed = /ROOT_COMMAND_FAILED/.test(error.code);
    const cmdError = error.meta.matchedCommand?.cli || meta.cliInfo;

    cmdError.usage = cmdError.usage.trim();
    cmdError.name = cmdError.name === '_' ? '' : cmdError.name;

    let fLine = isRootFailed
      ? meta.config.name || meta.cliInfo.name
      : `${meta.cliInfo.name} ${cmdError.name}`;

    fLine = meta.singleMode ? meta.config.name || fLine.trim() || 'cli' : fLine;

    console.error('%s: command "%s" failed with "%s"', error.code, fLine.trim(), error.toString());

    if (meta.argv.verbose) {
      console.error('');
      console.error(error.stack);
    }

    console.error('\n$ %s --verbose', fLine.trim());
    console.error('$ %s --help', fLine.trim());
    console.error('');

    meta.config.exit(1);
    return;
  }

  if (error) {
    const helpLine =
      meta.cliInfo.helpLine === meta.cliInfo.name
        ? `${meta.cliInfo.name} ${meta.matchedCommand.key || meta.matchedCommand?.cli?.name || ''}`
        : meta.cliInfo.helpLine.replace(meta.cliInfo.usage, '');

    // console.log('meta.cliInfo', meta.cliInfo, failed ? 'sasa' : 12);
    const failingArguments =
      (error.code === 'ERR_COMMAND_FAILED' && error.cmdUsage) || meta.rootCommand;

    if (failingArguments) {
      console.error('%s:', info.code, error.message);
      // console.log('ZZZZZZZZZZZZZZZ', meta, failed);
    } else {
      console.error(
        '%s: command "%s" failed with "%s"',
        info.code,
        meta.cliInfo.name,
        error.message,
      );
    }
    // Called renamed function updateHelpLine
    updateHelpLine(meta, error);
    console.error('\n$ %s --verbose', helpLine.trim());
    console.error('$ %s --help\n', helpLine.trim());
    meta.config.exit(info.exitCode);
    return;
  }

  // Called renamed function updateHelpLine
  updateHelpLine(meta);

  const cc = 'ERR_NO_COMMAND_SPECIFIED';
  console.error('%s: no command specified and showHelpOnEmpty not enabled', cc);
  console.error('\n$ %s [options]\n', meta.cliInfo.helpLine);

  showAvailableCommands(meta, console.error);

  meta.config.exit(1);
}

// Renamed function udpateHelpLine to updateHelpLine
function updateHelpLine(meta, error) {
  if (error && error.meta?.cliInfo) {
    // Ensure error.meta.cliInfo exists
    // Renamed nnn to errorCommandName and hhh to errorCommandHelpLine
    const errorCommandName = error.meta.cliInfo.name;
    const errorCommandHelpLine = error.meta.cliInfo.helpLine;

    let line =
      errorCommandHelpLine === errorCommandName
        ? errorCommandHelpLine.replace(errorCommandName, error?.cmdUsage || '')
        : errorCommandHelpLine;

    // Ensure line replacement logic is sound
    line =
      errorCommandHelpLine === line
        ? line // No replacement happened, use original
        : `${errorCommandHelpLine.startsWith(errorCommandName) ? '' : errorCommandName} ${line}`; // Prepend name if needed

    meta.cliInfo.helpLine = line.trim();

    if (meta.argv.verbose) {
      console.error('');
      console.error(error.stack);
    }
  } else if (meta.entries.length > 1 && meta.rootCommand) {
    const name = meta.cliInfo.usage === '' ? `${meta.cliInfo.name} <command>` : meta.cliInfo.name;

    meta.cliInfo.helpLine = `${name} ${meta.cliInfo.usage}`.trim();
  }

  return meta;
}

export function getAvailableCommands(meta) {
  const res = [];

  for (const [key, cmd] of meta.entries) {
    let rootName = meta.rootCommand?.cli?.name || '';

    if (rootName === '_') {
      rootName = meta.config.name || 'cli';
    }
    const cliName = rootName || meta.config.name || 'cli';

    const cmdName = `${cliName} ${key}`.trim();
    res.push(`- ${cmdName} ${cmd.cli.usage}`.trim());
  }

  return res;
}

export function showAvailableCommands(meta, log) {
  const available = getAvailableCommands(meta);

  if (available.length > 0) {
    log('Available commands:');
  }

  // Use forEach as map return value is unused
  for (const line of available) log(line);
}
