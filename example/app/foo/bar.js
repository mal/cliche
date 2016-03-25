'use strict'

const command = function (args) {
  console.log('Welcome to the BAR command!')
  console.log('The following arguments were received:')
  console.log(args)
}

command.description = 'the original follow up act to foo'

module.exports = command
