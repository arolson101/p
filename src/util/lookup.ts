
export type Lookup<K, T> = Map<K, T>

export namespace Lookup {
  export const create = <K, T extends PouchDB.Core.Document<any>>(items: T[] = []): Lookup<K, T> => (
    items.reduce(
      (map, item) => {
        map.set(item._id, item)
        return map
      },
      new Map<K, T>()
    )
  )

  export const values = <K, T>(lookup: Lookup<K, T>) => (
    lookup
    ? lookup.values()
    : []
  )

  export const map = <K, T, V>(lookup: Lookup<K, T>, cb: (item: T) => V): V[] => (
    lookup
    ? Array.from(lookup.values()).map(cb)
    : []
  )

  export const filter = <K, T>(lookup: Lookup<K, T>, pred: (item: T) => boolean): T[] => (
    lookup
    ? Array.from(lookup.values()).filter(pred)
    : []
  )

  export const hasAny = (lookup: Lookup<any, any>): boolean => (
    lookup
    ? lookup.size !== 0
    : false
  )

  export const isEmpty = (lookup: Lookup<any, any>): boolean => (
    lookup
    ? lookup.size === 0
    : true
  )
}
