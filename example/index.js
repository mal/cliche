'use strict'

const cliche = require('../index')

cliche({
  name: 'cliche-example',
  root: './app',
  routes: [
    'foo/bar',
    'foo/baz',
    'hello/world'
  ]
})
