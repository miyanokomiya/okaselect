import type { Items, SelectedItemMap, Options } from './core'

export function itemSelectable<T>(
  getItems: () => Items<T>,
  options: Options = {}
) {
  const onUpdated = options.onUpdated ?? (() => {})

  // this map save the order of selections
  let selectedIds: SelectedItemMap = new Map()

  // returned array keeps the order of selections
  function getSelectedList(): string[] {
    return Array.from(selectedIds.keys())
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
    const keys = Array.from(selectedIds.keys())
    return keys.length === 0 ? undefined : keys[keys.length - 1]
  }

  function isAllSelected(): boolean {
    const allIds = Object.keys(getItems())
    return allIds.length > 0 && allIds.every((id) => selectedIds.has(id))
  }

  function select(id: string, ctrl = false): void {
    applySelect(selectedIds, id, ctrl)
    onUpdated()
  }

  function multiSelect(ids: string[], ctrl = false): void {
    const alreadySelectedIds = ids.filter((id) => selectedIds.has(id))

    if (ctrl) {
      if (alreadySelectedIds.length === ids.length) {
        // clear these ids
        alreadySelectedIds.forEach((id) => selectedIds.delete(id))
      } else {
        ids.forEach((id) => selectedIds.set(id, true))
      }
      onUpdated()
    } else {
      selectedIds = new Map(ids.map((id) => [id, true]))
      onUpdated()
    }
  }

  function selectAll(toggle = false): void {
    if (toggle && isAllSelected()) {
      selectedIds.clear()
    } else {
      selectedIds = new Map(Object.keys(getItems()).map((id) => [id, true]))
    }
    onUpdated()
  }

  function clear(id: string): void {
    selectedIds.delete(id)
    onUpdated()
  }

  function clearAll(): void {
    selectedIds.clear()
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
