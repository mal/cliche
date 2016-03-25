'use strict'

const spawn = require('child_process').spawn

const command = function () {
  spawn('git', ['describe', '--always'], {
    cwd: __dirname,
    stdio: 'inherit'
  })
}

module.exports = command
