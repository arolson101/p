import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import { AppThunk } from '../state'
import { TCacheSetAction } from './index'
import { Account } from './account'

export interface Institution {
  name: string
  web?: string
  address?: string
  notes?: string

  online?: boolean

  fid?: string
  org?: string
  ofx?: string

  login?: {
    username: string
    password: string
  }
}

export namespace Institution {
  export type Id = ':institution' | 'create' | makeid | ''
  export type DocId = 'institution/:institution'
  export type Doc = PouchDB.Core.Document<Institution> & { _id: DocId }
  export interface Params { institution: Id }
  export const route = 'institution/:institution'
  export const docId = docURI.route<Params, DocId>(route)
  export const startkey = docId({institution: ''})
  export const endkey = docId({institution: ''}) + '\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export const create = docId({institution: 'create'})
  export const accountCreatePath = (institution: Doc): string => {
    const iparams = docId(institution._id)
    if (!iparams) {
      throw new Error('not a institution docid: ' + institution._id)
    }
    return '/' + Account.docId({institution: iparams.institution, account: 'create'})
  }

  export const path = (institution: Doc): string => {
    return '/' + institution._id
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: Doc): boolean => {
    return !!docId(doc._id)
  }

  export const doc = (institution: Institution, lang: string): Doc => {
    const _id = docId({ institution: makeid(institution.name, lang) })
    return { _id, ...institution }
  }

  export const CHANGE_ACTION = 'institution/change'

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type CACHE_SET = 'institution/cacheSet'
  export const CACHE_SET = 'institution/cacheSet'
  export type CacheSetAction = TCacheSetAction<CACHE_SET, DocId, Doc>
  export const cacheSetAction = (cache: Cache): CacheSetAction => ({
    type: CACHE_SET,
    cache
  })

  export const cacheUpdateAction = (handle?: PouchDB.Database<any>): AppThunk =>
    async (dispatch) => {
      const results = handle ? await handle.find({selector: all}) : { docs: [] }
      const cache = createCache(results.docs)
      dispatch(cacheSetAction(cache))
    }
}
