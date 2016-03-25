'use strict'

const path = require('path')

const acquirer = function (base) {
  const error = {}

  const limit = Error.stackTraceLimit
  Error.stackTraceLimit = 1
  Error.captureStackTrace(error, cliche)
  Error.stackTraceLimit = limit

  const trace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const stack = error.stack
  Error.prepareStackTrace = trace

  const root = path.resolve(stack[0].getFileName(), '..', base)
  return function (route) {
    return require(path.join(root, ...route))
  }
}

const suppressed = Symbol('Silenced error')
const attempt = function () {
  const length = arguments.length
  for (let i = 0; i < length; ++i) {
    try {
      return arguments[i]()
    } catch (e) {}
  }
  return suppressed
}

const cliche = function (opts) {
  if (Array.isArray(opts)) {
    opts = {routes: opts}
  }

  if (!opts.routes || opts.routes.length === 0) {
    throw new Error('Must supply list of valid routes')
  }
  opts.routes = opts.routes.slice().sort()

  opts.args = opts.args || process.argv.slice(2)
  opts.help = opts.help || usage
  opts.name = opts.name || process.argv[1]
  opts.root = opts.root || '.'

  return router(opts)
}

const commonality = function (a, b) {
  const length = Math.min(a.length, b.length)
  let i = 0
  while (i < length && a[i] === b[i]) {
    ++i
  }
  return i
}

const router = function (opts) {
  const acquire = acquirer(opts.root)

  if (opts.args[0] === '--version') {
    const version = attempt(() => acquire(['.version'])())
    if (version !== suppressed) {
      return version
    }
  }

  const args = opts.args
  const routes = []
  let max = 0

  const length = opts.routes.length
  for (let i = 0; i < length; ++i) {
    const route = opts.routes[i].split('/')
    const score = commonality(route, args)

    if (max > score) {
      break
    }
    if (max < score) {
      max = score
      routes.length = 0
    }

    route.length = Math.min(route.length, max + 1)
    routes.push(route)
  }

  const route = args.slice(0, max)
  const name = [opts.name].concat(route).join(' ')

  if (routes.length === 1 && routes[0].length === max) {
    return acquire(routes[0])(args.slice(max), {name})
  }

  const inspect = function (route) {
    const meta = attempt(
      () => acquire(route),
      () => acquire(route.concat('.meta'))
    )
    return Object.assign({}, meta, {
      name: route[route.length - 1]
    })
  }

  const self = Object.assign(inspect(route), {name})
  const meta = routes
    .map(r => r.pop())
    .filter((n, i, a) => a.indexOf(n) === i)
    .map(r => route.concat(r))
    .map(inspect)

  return opts.help(self, meta)
}

const usage = function (self, routes) {
  const lines = [`usage: ${self.name} <command> [<args>]`, '']

  const about = self.about || self.description
  if (about) {
    lines.push(about, '')
  }

  const max = Math.max(...routes.map(c => c.name.length))
  const pad = ' '.repeat(max)
  lines.push('Available subcommands:', '')
  routes.forEach(c => {
    const name = `${c.name}${pad}`.slice(0, max)
    const description = c.description || '[no description available]'
    lines.push(`  ${name}  ${description}`)
  })
  lines.forEach(l => console.error(l))
}

module.exports = cliche
