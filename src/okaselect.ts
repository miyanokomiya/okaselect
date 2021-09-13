export type Identity = string | number
export type Items<T> = { [id: Identity]: T }

type SelectedMap = Map<Identity, true>

export function useSelectable<T>(getItems: () => Items<T>) {
  // this map save the order of selections
  let selectedIds: SelectedMap = new Map()

  // returned array keeps the order of selections
  function getSelectedIds(): Identity[] {
    return Array.from(selectedIds.keys())
  }
  function getSelectedItems(): T[] {
    const items = getItems()
    return Array.from(selectedIds.keys()).map((identity) => items[identity])
  }

  function getLastSelectedId(): Identity | undefined {
    const keys = Array.from(selectedIds.keys())
    return keys.length === 0 ? undefined : keys[keys.length - 1]
  }

  function select(id: Identity, shift = false): void {
    applySelect(selectedIds, id, shift)
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
    getSelectedIds,
    getLastSelectedId,
    select,
    selectAll,
    clear,
    clearAll,
  }
}

function applySelect(map: SelectedMap, id: Identity, shift = false): void {
  if (!shift) {
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
