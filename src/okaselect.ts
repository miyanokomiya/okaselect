export type Identity = string
export type Items<T> = { [id: Identity]: T }

type SelectedMap = Map<Identity, true>

export function useSelectable<T>(getItems: () => Items<T>) {
  // this map save the order of selections
  let selectedIds: SelectedMap = new Map()

  // returned array keeps the order of selections
  function getSelectedIds(): Identity[] {
    return Array.from(selectedIds.keys())
  }

  function getLastSelectedById(): Items<true> {
    return getSelectedIds().reduce<Items<true>>((ret, id) => {
      ret[id] = true
      return ret
    }, {})
  }

  function getSelectedItems(): T[] {
    const items = getItems()
    return getSelectedIds().map((identity) => items[identity])
  }

  function getLastSelectedItemsById(): Items<T> {
    const items = getItems()
    return getSelectedIds().reduce<Items<T>>((ret, id) => {
      ret[id] = items[id]
      return ret
    }, {})
  }

  function getLastSelectedId(): Identity | undefined {
    const keys = Array.from(selectedIds.keys())
    return keys.length === 0 ? undefined : keys[keys.length - 1]
  }

  function select(id: Identity, ctrl = false): void {
    applySelect(selectedIds, id, ctrl)
  }

  function multiSelect(ids: Identity[], ctrl = false): void {
    const alreadySelectedIds = ids.filter((id) => selectedIds.has(id))

    if (ctrl) {
      if (alreadySelectedIds.length === ids.length) {
        // clear these ids
        alreadySelectedIds.forEach((id) => selectedIds.delete(id))
      } else {
        ids.forEach((id) => selectedIds.set(id, true))
      }
    } else {
      selectedIds = new Map(ids.map((id) => [id, true]))
    }
  }

  function selectAll(toggle = false): void {
    selectedIds = execSelectAll(
      Object.keys(getItems()),
      selectedIds.size,
      toggle
    )
  }

  function clear(id: Identity): void {
    selectedIds.delete(id)
  }

  function clearAll(): void {
    selectedIds.clear()
  }

  return {
    getSelectedItems,
    getLastSelectedItemsById,
    getSelectedIds,
    getLastSelectedById,
    getLastSelectedId,
    select,
    multiSelect,
    selectAll,
    clear,
    clearAll,
  }
}

function applySelect(map: SelectedMap, id: Identity, ctrl = false): void {
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

function execSelectAll(
  allIds: string[],
  selectedSize: number,
  toggle = false
): SelectedMap {
  if (toggle && allIds.length <= selectedSize) {
    return new Map()
  } else {
    return new Map(allIds.map((id) => [id, true]))
  }
}
