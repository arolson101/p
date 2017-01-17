import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import { TCacheSetAction } from './index'
import { AppThunk } from '../state'

export interface DbInfo {
  title: string
}

export namespace DbInfo {
  export type Id = ':dbInfo' | 'create' | makeid | ''
  export type DocId = 'dbInfo/:db'
  export type Doc = PouchDB.Core.Document<DbInfo> & { _id: DocId }
  export interface Params { db: Id }
  export const docId = docURI.route<Params, DocId>('dbInfo/:db')
  export const startkey = docId({db: ''})
  export const endkey = docId({db: ''}) + '\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export namespace routes {
    export const home = 'home'
  }

  export namespace to {
    export const home = () => {
      return '/home'
    }
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const doc = (dbInfo: DbInfo, lang: string): Doc => {
    const _id = docId({ db: makeid(dbInfo.title, lang) })
    return { _id, ...dbInfo }
  }

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type CACHE_SET = 'dbInfo/cacheSet'
  export const CACHE_SET = 'dbInfo/cacheSet'
  export type CacheSetAction = TCacheSetAction<CACHE_SET, DocId, Doc>
  export const cacheSetAction = (cache: Cache): CacheSetAction => ({
    type: CACHE_SET,
    cache
  })

  export const cacheUpdateAction = (handle: PouchDB.Database<any>): AppThunk =>
    async (dispatch) => {
      const results = await handle.find({selector: all})
      const cache = createCache(results.docs)
      dispatch(cacheSetAction(cache))
    }
}
