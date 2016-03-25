'use strict'

const command = function (args) {
  console.log('Welcome to the BAZ command!')
  console.log('The following arguments were received:')
  console.log(args)
}

command.description = 'the defacto alterative to bar'

module.exports = command
