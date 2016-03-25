'use strict'

const cliche = require('../index')

const glob = require('glob')
const path = require('path')

const routes = glob.sync('**/*.js', {
  cwd: path.resolve(__dirname, './app')
}).map(f => f.slice(0, -3))

cliche({
  name: 'cliche-example-with-glob',
  root: './app',
  routes
})
