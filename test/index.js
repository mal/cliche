'use strict'

const assert = require('assert')

const cliche = require('../')

const routes = ['add', 'bisect/help', 'commit', 'remote/add', 'remote/remove']
const execute = function (args, opts) {
  return cliche(Object.assign({root: './fixtures', routes, args}, opts))
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
  
  describe('inspect', function () {
    it('should use executable when no app name', function (done) {
      execute(['badgers'], {help: (self, subs) => {
        assert.equal(self.name, process.argv[1])
        done()
      }})
    })

    it('should use app name when available', function (done) {
      execute(['badgers'], {name: 'test-app', help: (self, subs) => {
        assert.equal(self.name, 'test-app')
        done()
      }})
    })

    it('should use metadata files', function (done) {
      execute(['remote'], {help: (self, subs) => {
        assert.equal(self.about, 'remote about text')
        assert.equal(self.description, 'remote description')
        done()
      }})
    })

    it('should tollerate missing metadata', function (done) {
      execute(['bisect'], {help: (self, subs) => {
        assert.equal(self.about, undefined)
        assert.equal(self.description, undefined)
        done()
      }})
    })

    it('should use metadata from subcommands', function (done) {
      execute(['remote'], {help: (self, subs) => {
        assert.equal(subs.length, 2)
        assert.equal(subs[0].name, 'add')
        assert.equal(subs[0].description, 'remote/add description')
        assert.equal(subs[1].name, 'remove')
        assert.equal(subs[1].description, undefined)
        done()
      }})
    })
  })

  describe('router', function () {
    routes.forEach(route => {
      const shuffled = routes.slice().sort(v => Math.random() * 2 - 1)
      it(`should route ${route} correctly`, function () {
        const out = execute(route.split('/'), {routes: shuffled})
        assert.equal(out[0], `${route} fn`)
      })
    })

    it('should pass unused arguments', function () {
      const out = execute(['add', 'hello', 'world'])
      assert.equal(out.length, 3)
      assert.equal(out[1], 'hello')
      assert.equal(out[2], 'world')
    })

    it('should display help when unable to route', function (done) {
      execute(['badgers'], {help: () => done()})
    })
  })

  describe('usage', function () {
    it('should render usage information', function () {
      const out = capture(() => execute([], {name: 'test-app'}))
      assert.equal(out[0], 'usage: test-app <command> [<args>]')
    })

    it('should render about text', function () {
      const out = capture(() => execute(['remote']))
      assert.equal(out[2], 'remote about text')
    })

    it('should render description when no about', function () {
      const out = capture(() => execute([]))
      assert.equal(out[2], 'app description')
    })

    it('should skip when no about or description', function () {
      const out = capture(() => execute(['bisect']))
      assert.equal(out[2], 'Available subcommands:')
    })

    it('should render subcommand information', function () {
      const out = capture(() => execute([]))
      assert.equal(out[6], '  add     add description')
      assert.equal(out[7], '  bisect  [no description available]')
      assert.equal(out[8], '  commit  commit description')
      assert.equal(out[9], '  remote  remote description')
    })
  })

  describe('version', function () {
    it('should display info from version file', function () {
      const out = execute(['--version'])
      assert.equal(out, '0.0.0')
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
