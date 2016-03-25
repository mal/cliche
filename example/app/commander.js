'use strict'

// Place everything inside run function for maximum laziness
const run = function (args, opts) {
  const program = require('commander')

  program
    .option('-a, --apples', 'Add apples')
    .option('-b, --bananas', 'Add bananas')
    .option('-c, --cherries', 'Add cherries')
    .option('-d, --dates', 'Add dates')
    .parse(['node', opts.name].concat(args))

  console.log('You fruit salad will have:');
  const list = []
  if (program.apples) list.push('  - apples');
  if (program.bananas) list.push('  - bananas');
  if (program.cherries) list.push('  - cherries');
  if (program.dates) list.push('  - dates');
  if (list.length === 0) {
    list.push('  - nothing')
  }
  console.log(list.join('\n'))
}

// Attach a little metadata for cliche
run.description = 'an example of a commander.js subcommand'

module.exports = run
