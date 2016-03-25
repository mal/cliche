'use strict'

const cliche = require('../index')

cliche({
  name: 'example',
  root: './app',
  routes: [
    'foo/bar',
    'foo/baz',
    'hello/world'
  ]
})
