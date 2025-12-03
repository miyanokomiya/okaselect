![Main](https://github.com/miyanokomiya/okaselect/workflows/Main/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# okaselect
This is a convenient tool for the features of selecting.  
You can select your items with some petterns: ctrl-select, multi-select, all-select and so on by this tool.

## usage

```sh
npm install okaselect
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
$ pnpm install

# lint
$ pnpm lint

# test
$ pnpm test [--watch]

# build
$ pnpm build
```

## publish
Create new release on Github.
