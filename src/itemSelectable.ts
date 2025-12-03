import type { Items, SelectedItemMap, Options } from './core'
import * as core from './core'

export function useItemSelectable<T>(
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
    return core.getLastSelected(selectedMap)
  }

  function isAllSelected(): boolean {
    const allIds = Object.keys(getItems())
    return allIds.length > 0 && allIds.every((id) => selectedMap.has(id))
  }

  function isAnySelected(): boolean {
    return !!getLastSelected()
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
    if (!selectedMap.has(id)) return

    selectedMap.delete(id)
    onUpdated()
  }

  function clearAll(): void {
    if (selectedMap.size === 0) return

    selectedMap.clear()
    onUpdated()
  }

  function createSnapshot(): [string, true][] {
    return Array.from(selectedMap.entries())
  }

  function restore(snapshot: [string, true][]) {
    selectedMap = new Map(snapshot)
    onUpdated()
  }

  return {
    getSelected,
    getSelectedList,
    getSelectedItemList,
    getSelectedItems,
    getLastSelected,
    isAllSelected,
    isAnySelected,

    select,
    multiSelect,
    selectAll,
    clear,
    clearAll,
    createSnapshot,
    restore,
  }
}
export type ItemSelectable = ReturnType<typeof useItemSelectable>

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
