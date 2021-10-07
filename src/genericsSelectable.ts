import type {
  Items,
  GenericsAttrs,
  Options,
  SelectedGenericsAttrMap,
} from './core'
import * as core from './core'

export function useGenericsSelectable<T, K extends GenericsAttrs>(
  getItems: () => Items<T>,
  getItemType: (item: T) => string,
  attrKeys: { [type: string]: string[] },
  options: Options = {}
) {
  const onUpdated = options.onUpdated ?? (() => {})

  let selectedMap: SelectedGenericsAttrMap<K> = new Map()

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
      .filter(([, gAttrs]) => {
        return core.isAllAttrsSelected(attrKeys[gAttrs.type], gAttrs.attrs)
      })
      .map(([key]) => key)
  }

  function isAllSelected(): boolean {
    const allIds = Object.keys(getItems())
    return (
      allIds.length > 0 &&
      allIds.every((id) => {
        const gAttrs = selectedMap.get(id)
        return (
          gAttrs && core.isAllAttrsSelected(attrKeys[gAttrs.type], gAttrs.attrs)
        )
      })
    )
  }

  function isAnySelected(): boolean {
    return !!getLastSelected()
  }

  function select(id: string, attrKey: string, ctrl = false): void {
    const type = getItemType(getItems()[id])
    applySelect(selectedMap, id, type, attrKey, ctrl)
    onUpdated()
  }

  function multiSelect(val: Items<K>, ctrl = false): void {
    applyMultiSelect(selectedMap, val, ctrl)
    onUpdated()
  }

  function selectAll(toggle = false): void {
    if (toggle && isAllSelected()) {
      selectedMap.clear()
    } else {
      selectedMap = new Map(
        Object.entries(getItems()).map(([id, item]) => {
          const type = getItemType(item)
          return [
            id,
            { type, attrs: core.createAllAttrsSelected(attrKeys[type]) } as K,
          ]
        })
      )
    }
    onUpdated()
  }

  function clear(id: string, attrKey: string): void {
    applyDelete(selectedMap, id, attrKey)
    onUpdated()
  }

  function clearAll(): void {
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

function setOrDeleteItem(
  map: SelectedGenericsAttrMap<GenericsAttrs>,
  id: string,
  gAttrs: GenericsAttrs
): void {
  if (Object.keys(gAttrs.attrs).length > 0) {
    map.set(id, gAttrs)
  } else {
    map.delete(id)
  }
}

function applySelect(
  map: SelectedGenericsAttrMap<GenericsAttrs>,
  id: string,
  type: string,
  attrKey: string,
  ctrl = false
): void {
  if (!ctrl) {
    map.clear()
    map.set(id, { type, attrs: { [attrKey]: true } })
  } else {
    const target = map.get(id)
    if (target) {
      if (target.attrs[attrKey]) {
        const next = { ...target }
        delete next.attrs[attrKey]
        setOrDeleteItem(map, id, next)
      } else {
        // delete and set to be a last item
        map.delete(id)
        map.set(id, { ...target, attrs: { ...target.attrs, [attrKey]: true } })
      }
    } else {
      map.set(id, { type, attrs: { [attrKey]: true } })
    }
  }
}

function applyMultiSelect(
  map: SelectedGenericsAttrMap<GenericsAttrs>,
  val: Items<GenericsAttrs>,
  ctrl = false
): void {
  if (!ctrl) {
    map.clear()
    Object.entries(val).forEach(([id, attrs]) => {
      map.set(id, { ...(map.get(id) ?? {}), ...attrs })
    })
  } else {
    if (isAttrsSelected(map, val)) {
      // clear the attrs if all of its have been selected already
      Object.entries(val).forEach(([id, gAttrs]) => {
        setOrDeleteItem(map, id, {
          type: gAttrs.type,
          attrs: core.dropAttrs(map.get(id)?.attrs, gAttrs.attrs),
        })
      })
    } else {
      // select the attrs if some attrs have not been selected yet
      Object.entries(val).forEach(([id, gAttrs]) => {
        map.set(id, {
          type: gAttrs.type,
          attrs: core.mergeAttrs(map.get(id)?.attrs, gAttrs.attrs),
        })
      })
    }
  }
}

function isAttrsSelected(
  map: SelectedGenericsAttrMap<GenericsAttrs>,
  val: Items<GenericsAttrs>
): boolean {
  return Object.entries(val).every(([id, gAttrs]) => {
    const target = map.get(id)
    return (
      target && core.isAllAttrsSelected(Object.keys(gAttrs.attrs), target.attrs)
    )
  })
}

function applyDelete(
  map: SelectedGenericsAttrMap<GenericsAttrs>,
  id: string,
  attrKey: string
): void {
  const target = map.get(id)
  if (target) {
    if (Object.keys(target.attrs).length === 1) {
      // delete it when no attrs exist
      map.delete(id)
    } else {
      const next = { ...target }
      delete next.attrs[attrKey]
      map.set(id, next)
    }
  }
}
