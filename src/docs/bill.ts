import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import { AppThunk } from '../state'
import { TCacheSetAction } from './index'
import * as RRule from 'rrule-alt'

export interface Bill {
  name: string
  notes?: string
  rrule?: RRule
}

export namespace Bill {
  export type Id = ':billId' | 'create' | makeid
  export type DocId = 'bill/:billId'
  export type Doc = PouchDB.Core.Document<Bill> & { _id: DocId; _rev?: string }
  export interface Params { billId: Id }
  export const docId = docURI.route<Params, DocId>('bill/:billId')
  export const startkey = 'bill/'
  export const endkey = 'bill/\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export namespace routes {
    export const all = 'bills'
    export const create = 'bill/create'
    export const view = 'bill/:billId'
    export const edit = 'bill/:billId/edit'
    export const del = 'bill/:billId/delete'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
    }

    export const create = () => {
      return '/' + routes.create
    }

    export const view = (bill: Doc): string => {
      return '/' + bill._id
    }

    export const edit = (bill: Doc): string => {
      return '/' + bill._id + '/edit'
    }

    export const del = (bill: Doc): string => {
      return '/' + bill._id + '/delete'
    }
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: Doc): boolean => {
    return !!docId(doc._id)
  }

  export const doc = (bank: Bill, lang: string): Doc => {
    const _id = docId({ billId: makeid(bank.name, lang) })
    return { _id, ...bank }
  }

  export const CHANGE_ACTION = 'bill/change'

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type CACHE_SET = 'bill/cacheSet'
  export const CACHE_SET = 'bill/cacheSet'
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