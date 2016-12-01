
export interface Lookup<T> {
  [id: string]: T
}

export namespace Lookup {
  export const create = <T extends PouchDB.Core.Document<any>>(items: T[]): Lookup<T> => (
    items.reduce(
      (map, item) => {
        map[item._id] = item
        return map
      },
      {} as Lookup<T>
    )
  )

  export const values = <T>(lookup: Lookup<T>): T[] => (
    lookup
    ? Object.keys(lookup).map(id => lookup[id])
    : []
  )

  export const map = <T, V>(lookup: Lookup<T>, cb: (item: T) => V): V[] => (
    lookup
    ? Object.keys(lookup).map(id => cb(lookup[id]))
    : []
  )

  export const hasAny = (lookup: Lookup<any>): boolean => (
    lookup
    ? Object.keys(lookup).length !== 0
    : false
  )

  export const isEmpty = (lookup: Lookup<any>): boolean => (
    lookup
    ? Object.keys(lookup).length === 0
    : true
  )
}
