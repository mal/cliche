'use strict'

const cliche = require('../index')

cliche({
  name: 'cliche-example',
  root: './app',
  routes: [
    'commander',
    'foo/bar',
    'foo/baz',
    'hello/world'
  ]
})
