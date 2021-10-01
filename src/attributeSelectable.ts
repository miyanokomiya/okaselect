import type { Items, SelectedAttrMap, Attrs, Options } from './core'

export function useAttributeSelectable<T, K extends Attrs>(
  getItems: () => Items<T>,
  options: Options = {}
) {
  const onUpdated = options.onUpdated ?? (() => {})

  // this map save the order of selections
  const selectedMap: SelectedAttrMap<K> = new Map()

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

  function select(id: string, attrKey: string, ctrl = false): void {
    applySelect(selectedMap, id, attrKey, ctrl)
    onUpdated()
  }

  function clear(id: string, attrKey: string): void {
    applyDelete(selectedMap, id, attrKey)
    onUpdated()
  }

  return {
    getSelected,
    getLastSelected,

    select,
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
