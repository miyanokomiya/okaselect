import type { Items, SelectedAttrMap, Attrs, Options } from './core'
import * as core from './core'

export function useAttributeSelectable<T, K extends Attrs>(
  getItems: () => Items<T>,
  attrKeys: string[],
  options: Options = {}
) {
  const onUpdated = options.onUpdated ?? (() => {})

  // this map save the order of selections
  let selectedMap: SelectedAttrMap<K> = new Map()

  function getSelected(): Items<K> {
    return Array.from(selectedMap.entries()).reduce<Items<K>>(
      (ret, [key, attrs]) => {
        ret[key] = attrs
        return ret
      },
      {}
    )
  }

  function getLastSelected(): string | undefined {
    return core.getLastSelected(selectedMap)
  }

  function getAllAttrsSelected(): string[] {
    return Array.from(selectedMap.entries())
      .filter(([, attrs]) => {
        return core.isAllAttrsSelected(attrKeys, attrs)
      })
      .map(([key]) => key)
  }

  function isAllSelected(): boolean {
    const allIds = Object.keys(getItems())
    return (
      allIds.length > 0 &&
      allIds.every((id) => {
        const attrs = selectedMap.get(id)
        return attrs && core.isAllAttrsSelected(attrKeys, attrs)
      })
    )
  }

  function isAnySelected(): boolean {
    return !!getLastSelected()
  }

  function select(id: string, attrKey: string, ctrl = false): void {
    applySelect(selectedMap, id, attrKey, ctrl)
    onUpdated()
  }

  function multiSelect(val: Items<K> | Map<string, Attrs>, ctrl = false): void {
    applyMultiSelect(selectedMap, val, ctrl)
    onUpdated()
  }

  function selectAll(toggle = false): void {
    if (toggle && isAllSelected()) {
      selectedMap.clear()
    } else {
      selectedMap = new Map(
        Object.keys(getItems()).map((id) => [
          id,
          core.createAllAttrsSelected<K>(attrKeys),
        ])
      )
    }
    onUpdated()
  }

  function clear(id: string, attrKey: string): void {
    if (!selectedMap.has(id)) return

    applyDelete(selectedMap, id, attrKey)
    onUpdated()
  }

  function clearAll(): void {
    if (selectedMap.size === 0) return

    selectedMap.clear()
    onUpdated()
  }

  function createSnapshot(): [string, K][] {
    return Array.from(selectedMap.entries())
  }

  function restore(snapshot: [string, K][]) {
    selectedMap = new Map(snapshot)
    onUpdated()
  }

  return {
    getSelected,
    getLastSelected,
    getAllAttrsSelected,
    isAllSelected,
    isAnySelected,
    isAttrsSelected: (val: Items<K>) => isAttrsSelected(selectedMap, val),

    select,
    multiSelect,
    selectAll,
    clear,
    clearAll,
    createSnapshot,
    restore,
  }
}

function applySelect(
  map: SelectedAttrMap<Attrs>,
  id: string,
  attrKey: string,
  ctrl = false
): void {
  if (!ctrl) {
    map.clear()
    map.set(id, { [attrKey]: true })
  } else {
    const target = map.get(id)
    if (target) {
      if (target[attrKey]) {
        const next = { ...target }
        delete next[attrKey]
        setOrDeleteItem(map, id, next)
      } else {
        // delete and set to be a last item
        map.delete(id)
        map.set(id, { ...target, [attrKey]: true })
      }
    } else {
      map.set(id, { [attrKey]: true })
    }
  }
}

function applyMultiSelect(
  map: SelectedAttrMap<Attrs>,
  val: Items<Attrs> | Map<string, Attrs>,
  ctrl = false
): void {
  const entries = core.getEntries(val)
  if (!ctrl) {
    map.clear()
    entries.forEach(([id, attrs]) => {
      map.set(id, { ...(map.get(id) ?? {}), ...attrs })
    })
  } else {
    if (isAttrsSelected(map, val)) {
      // clear the attrs if all of its have been selected already
      entries.forEach(([id, attrs]) => {
        setOrDeleteItem(map, id, core.dropAttrs(map.get(id), attrs))
      })
    } else {
      // select the attrs if some attrs have not been selected yet
      entries.forEach(([id, attrs]) => {
        map.set(id, core.mergeAttrs(map.get(id), attrs))
      })
    }
  }
}

function setOrDeleteItem(
  map: SelectedAttrMap<Attrs>,
  id: string,
  attrs: Attrs
): void {
  if (Object.keys(attrs).length > 0) {
    map.set(id, attrs)
  } else {
    map.delete(id)
  }
}

function isAttrsSelected(
  map: SelectedAttrMap<Attrs>,
  val: Items<Attrs> | Map<string, Attrs>
): boolean {
  return core.getEntries(val).every(([id, attrs]) => {
    const target = map.get(id)
    return target && core.isAllAttrsSelected(Object.keys(attrs), target)
  })
}

function applyDelete(
  map: SelectedAttrMap<Attrs>,
  id: string,
  attrKey: string
): void {
  const target = map.get(id)
  if (target) {
    if (Object.keys(target).length === 1) {
      // delete it when no attrs exist
      map.delete(id)
    } else {
      const next = { ...target }
      delete next[attrKey]
      map.set(id, next)
    }
  }
}
