type Items<T> = { [id: string]: T }
type SelectedMap = Map<string, true>

export function itemSelectable<T>(
  getItems: () => Items<T>,
  options: {
    onUpdated?: () => void
  } = {}
) {
  const onUpdated = options.onUpdated ?? (() => {})

  // this map save the order of selections
  let selectedIds: SelectedMap = new Map()

  // returned array keeps the order of selections
  function getSelectedIds(): string[] {
    return Array.from(selectedIds.keys())
  }

  function getSelectedById(): Items<true> {
    return getSelectedIds().reduce<Items<true>>((ret, id) => {
      ret[id] = true
      return ret
    }, {})
  }

  function getSelectedItems(): T[] {
    const items = getItems()
    return getSelectedIds().map((identity) => items[identity])
  }

  function getSelectedItemsById(): Items<T> {
    const items = getItems()
    return getSelectedIds().reduce<Items<T>>((ret, id) => {
      ret[id] = items[id]
      return ret
    }, {})
  }

  function getLastSelectedId(): string | undefined {
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
    getSelectedItems,
    getSelectedItemsById,
    getSelectedIds,
    getSelectedById,
    getLastSelectedId,
    isAllSelected,

    select,
    multiSelect,
    selectAll,
    clear,
    clearAll,
  }
}
export type ItemSelectable = ReturnType<typeof itemSelectable>

function applySelect(map: SelectedMap, id: string, ctrl = false): void {
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