import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import { AppThunk } from '../state'
import { TCacheSetAction } from './index'
import { Account } from './Account'

export interface Bank {
  fi?: string

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

  accounts: Account.DocId[]
}

export namespace Bank {
  export type Id = ':bankId' | 'create' | makeid
  export type DocId = 'bank/:bankId'
  export type Doc = PouchDB.Core.Document<Bank> & { _id: DocId; _rev?: string }
  export interface Params { bankId: Id }
  export const docId = docURI.route<Params, DocId>('bank/:bankId')
  export const startkey = 'bank/'
  export const endkey = 'bank/\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export namespace routes {
    export const all = 'banks'
    export const create = 'bank/create'
    export const view = 'bank/:bankId'
    export const edit = 'bank/:bankId/edit'
    export const del = 'bank/:bankId/delete'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
    }

    export const create = () => {
      return '/' + routes.create
    }

    export const view = (bank: Doc): string => {
      return '/' + bank._id
    }

    export const edit = (bank: Doc): string => {
      return '/' + bank._id + '/edit'
    }

    export const del = (bank: Doc): string => {
      return '/' + bank._id + '/delete'
    }

    export const accountCreate = (bank: Doc): string => {
      const iparams = docId(bank._id)
      if (!iparams) {
        throw new Error('not a bank docid: ' + bank._id)
      }
      return '/' + Account.docId({bankId: iparams.bankId, accountId: 'create'})
    }
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: Doc): boolean => {
    return !!docId(doc._id)
  }

  export const doc = (bank: Bank, lang: string): Doc => {
    const _id = docId({ bankId: makeid(bank.name, lang) })
    return { _id, ...bank }
  }

  export const CHANGE_ACTION = 'bank/change'

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type CACHE_SET = 'bank/cacheSet'
  export const CACHE_SET = 'bank/cacheSet'
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
