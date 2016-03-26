'use strict'

const assert = require('assert')

const cliche = require('../')

const routes = ['add', 'bisect/help', 'commit', 'remote/add', 'remote/remove']
const execute = function (args, opts) {
  return cliche(Object.assign({root: './fixtures', routes, args}, opts))
}

const args = function (args, fn) {
  const argv = process.argv
  process.argv = ['node', __filename, ...args]
  const out = fn()
  process.argv = argv
  return out
}

const capture = function (fn) {
  let data = []
  const conerr = console.error
  console.error = chunk => data += `${chunk}\n`
  fn()
  console.error = conerr
  return data.split('\n')
}

describe('cliche', function () {
  
  describe('entry', function () {
    it('should assume routes when given an array', function () {
      const out = args(['fixtures', 'commit'], () => {
        return cliche(['fixtures/add', 'fixtures/commit'])
      })
      assert.strictEqual(out[0], 'commit fn')
    })

    it('should throw an error when no routes', function () {
      assert.throws(() => cliche([]), Error)
    })
  })

  describe('inspect', function () {
    it('should use executable when no app name', function (done) {
      execute(['badgers'], {help: (self, subs) => {
        assert.strictEqual(self.name, process.argv[1])
        done()
      }})
    })

    it('should use app name when available', function (done) {
      execute(['badgers'], {name: 'test-app', help: (self, subs) => {
        assert.strictEqual(self.name, 'test-app')
        done()
      }})
    })

    it('should use metadata files', function (done) {
      execute(['remote'], {help: (self, subs) => {
        assert.strictEqual(self.about, 'remote about text')
        assert.strictEqual(self.description, 'remote description')
        done()
      }})
    })

    it('should tollerate missing metadata', function (done) {
      execute(['bisect'], {help: (self, subs) => {
        assert.strictEqual(self.about, undefined)
        assert.strictEqual(self.description, undefined)
        done()
      }})
    })

    it('should use metadata from subcommands', function (done) {
      execute(['remote'], {help: (self, subs) => {
        assert.strictEqual(subs.length, 2)
        assert.strictEqual(subs[0].name, 'add')
        assert.strictEqual(subs[0].description, 'remote/add description')
        assert.strictEqual(subs[1].name, 'remove')
        assert.strictEqual(subs[1].description, undefined)
        done()
      }})
    })
  })

  describe('router', function () {
    routes.forEach(route => {
      const shuffled = routes.slice().sort(v => Math.random() * 2 - 1)
      it(`should route ${route} correctly`, function () {
        const out = execute(route.split('/'), {routes: shuffled})
        assert.strictEqual(out[0], `${route} fn`)
      })
    })

    it('should pass unused arguments', function () {
      const out = execute(['add', 'hello', 'world'])
      assert.strictEqual(out.length, 3)
      assert.strictEqual(out[1], 'hello')
      assert.strictEqual(out[2], 'world')
    })

    it('should pass other metadata', function () {
      const out = execute(['commit'], {name: 'test-app'})
      assert.strictEqual(out[1].name, 'test-app commit')
    })

    it('should display help when unable to route', function (done) {
      execute(['badgers'], {help: () => done()})
    })
  })

  describe('usage', function () {
    it('should render usage information', function () {
      const out = capture(() => execute([], {name: 'test-app'}))
      assert.strictEqual(out[0], 'usage: test-app <command> [<args>]')
    })

    it('should render usage with subcommands', function () {
      const out = capture(() => execute(['remote'], {name: 'test-app'}))
      assert.strictEqual(out[0], 'usage: test-app remote <command> [<args>]')
    })

    it('should render about text', function () {
      const out = capture(() => execute(['remote']))
      assert.strictEqual(out[2], 'remote about text')
    })

    it('should render description when no about', function () {
      const out = capture(() => execute([]))
      assert.strictEqual(out[2], 'app description')
    })

    it('should skip when no about or description', function () {
      const out = capture(() => execute(['bisect']))
      assert.strictEqual(out[2], 'Available subcommands:')
    })

    it('should render subcommand information', function () {
      const out = capture(() => execute([]))
      assert.strictEqual(out[6], '  add     add description')
      assert.strictEqual(out[7], '  bisect  [no description available]')
      assert.strictEqual(out[8], '  commit  commit description')
      assert.strictEqual(out[9], '  remote  remote description')
    })
  })

  describe('version', function () {
    it('should display info from version file', function () {
      const out = execute(['--version'])
      assert.strictEqual(out, '0.0.0')
    })

    it('should tollerate missing version file', function (done) {
      execute(['--version'], {
        help: () => done(),
        root: './fixtures/bisect',
        routes: ['help']
      })
    })
  })
})
