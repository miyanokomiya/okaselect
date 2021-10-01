import type { Items, SelectedAttrMap, Attrs, Options } from './core'

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
    const keys = Array.from(selectedMap.keys())
    return keys.length === 0 ? undefined : keys[keys.length - 1]
  }

  function isAllSelected(): boolean {
    const allIds = Object.keys(getItems())
    return (
      allIds.length > 0 &&
      allIds.every((id) => {
        const attrs = selectedMap.get(id)
        return attrs && isAllAttrsSelected(attrKeys, attrs)
      })
    )
  }

  function select(id: string, attrKey: string, ctrl = false): void {
    applySelect(selectedMap, id, attrKey, ctrl)
    onUpdated()
  }

  function selectAll(toggle = false): void {
    if (toggle && isAllSelected()) {
      selectedMap.clear()
    } else {
      selectedMap = new Map(
        Object.keys(getItems()).map((id) => [
          id,
          createAllAttrsSelected<K>(attrKeys),
        ])
      )
    }
    onUpdated()
  }

  function clear(id: string, attrKey: string): void {
    applyDelete(selectedMap, id, attrKey)
    onUpdated()
  }

  return {
    getSelected,
    getLastSelected,
    isAllSelected,

    select,
    selectAll,
    clear,
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
        if (Object.keys(target).length === 1) {
          // delete it when no attrs exist
          map.delete(id)
        } else {
          const next = { ...target }
          delete next[attrKey]
          map.set(id, next)
        }
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

function isAllAttrsSelected(attrKeys: string[], attrs: Attrs): boolean {
  return attrKeys.every((key) => attrs[key])
}

function createAllAttrsSelected<K extends Attrs>(attrKeys: (keyof Attrs)[]): K {
  return attrKeys.reduce<Attrs>((ret, key) => {
    ret[key] = true
    return ret
  }, {} as any) as K
}
