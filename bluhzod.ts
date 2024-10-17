import { z, ZodSchema } from 'zod';

// // type CommandMeta = {
// //   name: string;
// //   usage: string;
// //   description: string;
// //   aliases: string[];
// //   examples: string[];
// //   schema: ZodSchema;
// //   handler: (...args: any[]) => void;
// // };

// const CommandMetaSchema = z.object({
//   name: z.string(),
//   usage: z.string(),
//   description: z.string(),
//   aliases: z.array(z.string()),
//   examples: z.array(z.string()),
//   flags: z.array(),
//   handler: z.function(),
// });

// type CommandMeta = z.infer<typeof CommandMetaSchema>;

// function createCommand(usage: string, description?: string) {
//   const meta = {
//     name: '',
//     usage: usage || '',
//     description: description || '',
//     aliases: [],
//     examples: [],
//     handler: () => {},
//     schema: z.any(),
//   } as CommandMeta;

//   const name = usage.split(' ')[0] || 'unknown-command';
//   meta.name = name;

//   const cli = {
//     meta,

//     alias(...aliases: string[]) {
//       meta.aliases = aliases.flat();
//       return this;
//     },

//     example(...examples: string[]) {
//       meta.examples = examples.flatMap((x) => `${name} ${x}`);
//       return this;
//     },

//     option(flag = '', desc = '', _default? any) {
//       meta.
//       return this;
//     },

//     action(handler) {
//       const fn = z
//         .function()
//         .args(
//           z.object({
//             flags: meta.schema,
//             input: z.any(),
//           }),
//           CommandMetaSchema,
//         )
//         .implement(handler);

//       meta.handler = fn;
//       return this;
//     },
//   };

//   return cli;
// }

// const publish = createCommand(
//   'publish <...packages>',
//   'Publish given package names, using `npm publish -ws`.',
// )
//   .alias('pub', 'pubilsh', 'pblish', 'pb')
//   .flags();

// // prog
// //   .command('publish <...packages>', 'Publish given package names, using `npm publish -ws`.')
// //   // All packages affected of change in `@tunnckocore/p-all` package:
// //   //    hela publish $(hela affected @tunnckocore/p-all -p) --dry-run
// //   // All asia packages:
// //   //    hela publish asia --filter --otp 142342
// //   .alias('pub', 'pubilsh', 'pblish', 'pb')
// //   .example('publish package-one @scope/my-pkg')
// //   .example('publish asia --filter')
// //   .example('publish asia --filter --otp 242005')
// //   .example('publish mypkg --otp 242005')
// //   .option(
// //     '--filter',
// //     'Treat single package name as filter, so it will resolve all matching packages.',
// //   )
// //   .option('--dry', 'Does not run `npm publish`, instead show the compiled command', false)
// //   .option('--dry-run', 'Runs `npm publish` on dry-run, no publishing to registry.', false)
// //   .option('--otp <code>', 'Pass 2FA code to the `npm publish` --otp flag', {
// //     type: 'number',
// //   })
// //   .action(async ({ flags, packages, ...data }, meta) => {
// //     // NOTE: no need for this, because Yaro handles required arguments
// //     // if (packages.length === 0) {
// //     //   console.log('hela publish: input packages are required');
// //     //   return;
// //     // }

// //     if (flags.filter === true) {
// //       flags.filter = packages.map((x) => `*${x}*`);
// //     }

// //     flags.filter = [flags.filter].flat().filter(Boolean);

// //     const res = new Map();
// //     let wspc = false;

// //     if (flags.filter.length > 0) {
// //       const filtered = await filter(prog)(
// //         { ...data, flags: { ...flags, raw: true }, patterns: flags.filter },
// //         meta,
// //       );

// //       wspc = filtered.ws;

// //       for (const name of filtered.res) {
// //         if (!res.has(name)) {
// //           res.set(name, wspc.graph[name]);
// //         }
// //       }
// //     }

// //     if (wspc === false) {
// //       wspc = await workspaces(prog)({ flags: { ...flags, raw: true }, ...data }, meta);
// //     }

// //     for (const name of wspc.packages) {
// //       if (!res.has(name) && packages.includes(name)) {
// //         res.set(name, wspc.graph[name]);
// //       }
// //     }

// //     // TODO: monitor the reverse() thing, i think it's random
// //     const wsResolved = [...res.values()].map((x) => x.resolved).reverse();

// //     const npmFlagsString = toFlags({
// //       otp: flags.otp,
// //       dryRun: flags.dryRun,

// //       workspace: wsResolved,
// //     });

// //     await runNpmPublishCommand(npmFlagsString, wsResolved, flags);
// //   });

// eslint-disable no-param-reassign

function defineCommand(handler, description, config = {}) {
  const cmd = {
    handler,
    description,
  };
}

defineCommand('publish <>');

function defineOption(
  name: string,
  schema: ZodSchema,
  description: string = '',
  aliases: string[] = [],
) {
  return {
    name,
    schema,
    description,
    aliases,
  };
}

// const build = defineCommand({
//   name: 'build',
//   aliases: ['b'],
//   description: 'Build the project',
//   examples: ['src/index.ts dist', 'src', 'src dist'],
//   handler: async ({ flags, named }) => {
//     console.log('build', flags, named);
//   },

//   options: {
//     watch: defineOption('watch', z.boolean().default(false), 'Watch files', ['w', 'wacht']),
//   },
//   // flags: [
//   //   defineFlag({
//   //     name: 'watch',
//   //     aliases: ['w', 'wacht'],
//   //     description: 'Watch files',
//   //     type: z.boolean(),
//   //     default: false,
//   //   }),

//   //   defineFlag({
//   //     name: 'dry-run',
//   //     aliases: ['d'],
//   //     description: 'Dry run the build',
//   //     type: z.boolean(),
//   //     default: false,
//   //   }),
//   // ],
//   // flags: {
//   //   watch: { type: z.boolean(), alias: ['w', 'wacht'], default: false, description: 'Watch files' },
//   // },
// });

// // build({ flags: { foo: 'bar', dryRun: true }, input });
