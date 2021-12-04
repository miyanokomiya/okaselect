export type Items<T> = { [id: string]: T }

export type Attrs = { [key: string]: true }

export type GenericsAttrs = {
  type: string
  attrs: Attrs
}

export type SelectedItemMap = Map<string, true>

export type SelectedAttrMap<SelectedAttrs extends Attrs> = Map<
  string,
  SelectedAttrs
>

export type SelectedGenericsAttrMap<SelectedAttrs extends GenericsAttrs> = Map<
  string,
  SelectedAttrs
>

export type Options = {
  onUpdated?: () => void
}

export function getEntries<T>(items: Items<T> | Map<string, T>): [string, T][] {
  return items instanceof Map
    ? Array.from(items.entries())
    : Object.entries(items)
}

export function getLastSelected(
  selectedMap: Map<string, unknown>
): string | undefined {
  const keys = Array.from(selectedMap.keys())
  return keys.length === 0 ? undefined : keys[keys.length - 1]
}

export function isAllAttrsSelected(attrKeys: string[], attrs: Attrs): boolean {
  return attrKeys.every((key) => attrs[key])
}

export function dropAttrs(src: Attrs | undefined, val: Attrs): Attrs {
  return src
    ? Object.keys(src).reduce<Attrs>((p, key) => {
        if (!val[key]) {
          p[key] = true
        }
        return p
      }, {})
    : {}
}

export function mergeAttrs(src: Attrs | undefined, val: Attrs): Attrs {
  return src ? { ...src, ...val } : val
}

export function createAllAttrsSelected<K extends Attrs>(
  attrKeys: (keyof Attrs)[]
): K {
  return attrKeys.reduce<Attrs>((ret, key) => {
    ret[key] = true
    return ret
  }, {} as any) as K
}
