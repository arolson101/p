import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import { TCacheSetAction } from './index'

export interface DbInfo {
  title: string
}

export namespace DbInfo {
  export type Id = ':dbInfo' | makeid | ''
  export type DocId = 'dbInfo/:info'
  export type Doc = PouchDB.Core.Document<DbInfo> & { _id: DocId }
  export const docId = docURI.route<{db: Id}, DocId>('dbInfo/:db')
  export const startkey = docId({db: ''})
  export const endkey = docId({db: ''}) + '\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const idFromDocId = (dbInfo: DocId): Id => {
    const parts = docId(dbInfo)
    if (!parts) {
      throw new Error('not an dbinfo id: ' + dbInfo)
    }
    return parts.db
  }

  export const doc = (dbInfo: DbInfo): Doc => {
    const _id = docId({ db: makeid() })
    return { _id, ...dbInfo }
  }

  export const path = (dbInfo: Doc) => {
    const db = idFromDocId(dbInfo._id)
    return `/${db}/`
  }

  export const CHANGE_ACTION = 'dbInfo/change'

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs: Doc[]) => Lookup<DocId, Doc>

  export type CACHE_SET_ACTION = 'dbInfo/cacheSet'
  export const CACHE_SET_ACTION = 'dbInfo/cacheSet'
  export type CacheSetAction = TCacheSetAction<CACHE_SET_ACTION, DocId, Doc>
  export const cacheSetAction = (cache: Cache): CacheSetAction => ({
    type: CACHE_SET_ACTION,
    cache
  })
}
