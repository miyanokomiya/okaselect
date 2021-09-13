export type Identity = string | number
export type Items<T> = { [id: Identity]: T }

type SelectedMap = Map<Identity, true>

export function useSelectable<T>(getItems: () => Items<T>) {
  // this map save the order of selections
  const selectedIds: SelectedMap = new Map()

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
    execSelect(selectedIds, id, shift)
  }

  return {
    getSelectedItems,
    getSelectedIds,
    getLastSelectedId,
    select,
  }
}

function execSelect(map: SelectedMap, id: Identity, shift = false): void {
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
