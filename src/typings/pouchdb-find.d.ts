
declare namespace PouchDB {
  interface IndexOpts {
    index: {
      fields: string[]
      name?: string
      ddoc?: string
      type?: 'json'
    }
  }

  interface CreateIndexResult {
    result: 'created' | 'exists'
  }


  interface Selector_value { [key: string]: string | number | Selector }
  interface Selector_lt { $lt: string | number }
  interface Selector_gt { $gt: string | number }
  interface Selector_lte { $lte: string | number }
  interface Selector_gte { $gte: string | number }
  interface Selector_eq { $eq: string | number | boolean }
  interface Selector_ne { $ne: string | number | boolean }
  interface Selector_in { $in: string[] | number[] | boolean[] }
  interface Selector_exists { $exists: boolean }
  interface Selector_type { $type: 'null' | 'boolean' | 'number' | 'string' | 'array' | 'object' }
  interface Selector_and { $and: Selector[] }
  interface Selector_or { $or: Selector[] }

  type Selector =
    Selector_value
    | Selector_lt
    | Selector_gt
    | Selector_lte
    | Selector_gte
    | Selector_eq
    | Selector_ne
    | Selector_in
    | Selector_exists
    | Selector_type
    | Selector_and
    | Selector_or

  interface SortOpt {
    [key: string]: 'desc' | 'asc'
  }

  interface FindOpts {
    selector: Selector
    fields?: string[]
    sort?: SortOpt[]
    limit?: number
    skip?: number
  }

  interface FindResult<Content extends Core.Encodable> {
    docs: Content[]
  }

  interface Database<Content extends Core.Encodable> {
    createIndex(index: IndexOpts, callback?: Function): Promise<CreateIndexResult>
    find(request: FindOpts): Promise<FindResult<Content>>
  }
}

declare module "pouchdb-find"
