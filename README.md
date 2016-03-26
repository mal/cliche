# Cliche

Use a hierarchical directory tree to hold your CLI app multi-level subcommands.

[![Build Status](https://travis-ci.org/mal/cliche.svg?branch=master)](https://travis-ci.org/mal/cliche/) [![Build Status](https://ci.appveyor.com/api/projects/status/9mfre7qj8181f850?svg=true)](https://ci.appveyor.com/project/mal/cliche) [![Coverage Status](https://coveralls.io/repos/github/mal/cliche/badge.svg?branch=master)](https://coveralls.io/github/mal/cliche?branch=master)

This came about from a desire to add more structure to a tool with many nested
subcommands, something that can be achieved in other modules, but often with
a non-trivial amount of boilerplate. From a performance standpoint Cliche is
lazy loading to be as quick as possible even when dealing with very large
numbers of subcommands.

For those that like backronyms, how about: CLI Command Hierarchy Executor?

## Usage

Install with `npm`.

```
npm install cliche
```

**index.js**
```js
'use strict'

const cliche = require('cliche')

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
```

**app structure**
```
example
├── app
│   ├── commander.js      # example integration with commander
│   ├── foo
│   │   ├── bar.js        # example commands
│   │   ├── baz.js
│   │   └── .meta.js      # metadata for the foo group
│   ├── hello
│   │   └── world.js
│   ├── .meta.js          # metadata for the root group
│   └── .version.js       # version information
├── index.js
└── package.json
```

## Compatibility

Cliche can integrate with other CLI frameworks and option parsers on a command
by command basis. An example integration with [`commander`][commander] can be
found in [`example/app/commander.js`](/example/app/commander.js).

A very complementary module is [`glob`][glob] which can remove the overhead of
maintaining a list of routes. An example of how this can be achieved can be
found in [`example/globbed.js`](/example/globbed.js).

[commander]: https://www.npmjs.com/package/commander
[glob]: https://www.npmjs.com/package/glob

## Metadata

There are two levels of metadata: the command level and the directory level.

### Command

Currently the only metadata supported for commands is a `description` used for
generating usage information. It can be set on `module.exports.description` of
the relevant command.

[`example/app/hello/world.js`](/example/app/hello/world.js)
```
$ node example hello
[...]
Available subcommands:

  world  a computer program that outputs "Hello, World!"
```

### Directory

Directories function as parent commands, and as such have both a short
`description` which acts as a summary when viewing the parent command, and
a longer, more informational `about` to be shown when in the current command.
These values are contained in `.meta.js` files in the directory itself.

[`example/app/foo/.meta.js`](/example/app/foo/.meta.js)
```
$ node example
[...]
Available subcommands:

  foo        serves only to demonstrate a concept

$ node example foo
usage: cliche-example foo <command> [<args>]

A parent to both the bar and baz nested subcommands.

Available subcommands:
[...]
```

### Version

A top-level `--version` flag can be supported by providing a `.version.js`
file.

[`example/app/.version.js`](/example/app/.version.js)
```
$ node example --version
version 1.0.0
```

## Example

All commands shown in this file can be run from the root of the repo, and the
example project can be copied to use as a base for a new project. The example
app is fully usable to get a feel for how Cliche works, here are some
commands to try:

```
$ node example
$ node example --version
$ node example foo
$ node example foo bar now we can pass some arguments
$ node example hello world
$ node example commander --cherries
```
