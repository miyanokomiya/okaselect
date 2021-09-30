type Attributes = { [key: string]: true }
type Items<T> = { [id: string]: T }
type SelectedMap<SelectedAttributes extends Attributes> = Map<
  string,
  SelectedAttributes
>

export function useAttributeSelectable<
  T,
  SelectedAttributes extends Attributes
>(
  getItems: () => Items<T>,
  options: {
    onUpdated?: () => void
  } = {}
) {
  const onUpdated = options.onUpdated ?? (() => {})

  // this map save the order of selections
  const selectedById: SelectedMap<SelectedAttributes> = new Map()

  function getSelectedById(): Items<SelectedAttributes> {
    return Array.from(selectedById.entries()).reduce<Items<SelectedAttributes>>(
      (ret, [key, attrs]) => {
        ret[key] = attrs
        return ret
      },
      {}
    )
  }

  function getLastSelectedId(): string | undefined {
    const keys = Array.from(selectedById.keys())
    return keys.length === 0 ? undefined : keys[keys.length - 1]
  }

  function select(id: string, attrKey: string, ctrl = false): void {
    applySelect(selectedById, id, attrKey, ctrl)
    onUpdated()
  }

  return {
    getSelectedById,
    getLastSelectedId,

    select,
  }
}

function applySelect(
  map: SelectedMap<any>,
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
