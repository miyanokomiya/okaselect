export type Items<T> = { [id: string]: T }

export type Attrs = { [key: string]: true }

export type SelectedItemMap = Map<string, true>

export type SelectedAttrMap<SelectedAttrs extends Attrs> = Map<
  string,
  SelectedAttrs
>

export type Options = {
  onUpdated?: () => void
}
