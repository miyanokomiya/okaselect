import type { Items, SelectedItemMap, Options } from './core'

export function itemSelectable<T>(
  getItems: () => Items<T>,
  options: Options = {}
) {
  const onUpdated = options.onUpdated ?? (() => {})

  // this map save the order of selections
  let selectedMap: SelectedItemMap = new Map()

  // returned array keeps the order of selections
  function getSelectedList(): string[] {
    return Array.from(selectedMap.keys())
  }

  function getSelected(): Items<true> {
    return getSelectedList().reduce<Items<true>>((ret, id) => {
      ret[id] = true
      return ret
    }, {})
  }

  function getSelectedItemList(): T[] {
    const items = getItems()
    return getSelectedList().map((identity) => items[identity])
  }

  function getSelectedItems(): Items<T> {
    const items = getItems()
    return getSelectedList().reduce<Items<T>>((ret, id) => {
      ret[id] = items[id]
      return ret
    }, {})
  }

  function getLastSelected(): string | undefined {
    const keys = Array.from(selectedMap.keys())
    return keys.length === 0 ? undefined : keys[keys.length - 1]
  }

  function isAllSelected(): boolean {
    const allIds = Object.keys(getItems())
    return allIds.length > 0 && allIds.every((id) => selectedMap.has(id))
  }

  function select(id: string, ctrl = false): void {
    applySelect(selectedMap, id, ctrl)
    onUpdated()
  }

  function multiSelect(ids: string[], ctrl = false): void {
    const alreadySelectedIds = ids.filter((id) => selectedMap.has(id))

    if (ctrl) {
      if (alreadySelectedIds.length === ids.length) {
        // clear these ids
        alreadySelectedIds.forEach((id) => selectedMap.delete(id))
      } else {
        ids.forEach((id) => selectedMap.set(id, true))
      }
      onUpdated()
    } else {
      selectedMap = new Map(ids.map((id) => [id, true]))
      onUpdated()
    }
  }

  function selectAll(toggle = false): void {
    if (toggle && isAllSelected()) {
      selectedMap.clear()
    } else {
      selectedMap = new Map(Object.keys(getItems()).map((id) => [id, true]))
    }
    onUpdated()
  }

  function clear(id: string): void {
    selectedMap.delete(id)
    onUpdated()
  }

  function clearAll(): void {
    selectedMap.clear()
    onUpdated()
  }

  return {
    getSelected,
    getSelectedList,
    getSelectedItemList,
    getSelectedItems,
    getLastSelected,
    isAllSelected,

    select,
    multiSelect,
    selectAll,
    clear,
    clearAll,
  }
}
export type ItemSelectable = ReturnType<typeof itemSelectable>

function applySelect(map: SelectedItemMap, id: string, ctrl = false): void {
  if (!ctrl) {
    map.clear()
    map.set(id, true)
  } else {
    if (map.has(id)) {
      map.delete(id)
    } else {
      map.set(id, true)
    }
  }
}
