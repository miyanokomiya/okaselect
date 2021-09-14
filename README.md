![Main](https://github.com/miyanokomiya/okaselect/workflows/Main/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# okaselect
This is a convenient tool for the features of selecting.  
You can select your items with some petterns: ctrl-select, multi-select, all-select and so on by this tool.

## usage

```sh
yarn add okaselect
```

```js
import { useSelectable } from 'okaselect'

const items = { a: {}, b: {}, c: {} }
const selectable = useSelectable(() => items)

// single select
selectable.select('a')
console.log(selectable.getSelectedIds()) // => ['a']
selectable.select('b')
console.log(selectable.getSelectedIds()) // => ['b']

// ctrl select
selectable.select('c', true)
console.log(selectable.getSelectedIds()) // => ['b', 'c']
console.log(selectable.getLastSelectedId()) // => 'c'
```

## commnad

```sh
# install dependencies
$ yarn install

# lint
$ yarn lint

# test
$ yarn test [--watch]

# build
$ yarn build
```

## publish
Update `version` in `package.json`, commit with a comment `Release x.x.x` and merge into the `main` branch.
