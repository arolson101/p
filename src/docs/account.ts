import * as docURI from 'docuri'
import { Institution } from './institution'
import { makeid, Lookup } from '../util'
import { TCacheSetAction } from './index'
import { AppThunk } from '../state'

export interface Account {
  institution: Institution.DocId
  name: string
  type: Account.Type
  number: string
  visible: boolean
  balance: number
}

export namespace Account {
  // see ofx4js.domain.data.banking.AccountType
  export enum Type {
    CHECKING,
    SAVINGS,
    MONEYMRKT,
    CREDITLINE,
    CREDITCARD,
  }

  export type Id = ':account' | 'create' | makeid | ''
  export type DocId = 'account/:account'
  export type Doc = PouchDB.Core.Document<Account> & { _id: DocId }
  export interface Params { account: Id }
  export const route = 'account/:account'
  export const docId = docURI.route<Params, DocId>(route)
  export const startkey = docId({account: ''})
  export const endkey = docId({account: ''}) + '\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export const allForInstitution = (institution: Institution.Doc): PouchDB.Selector => ({
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } },
      { institution: institution._id }
    ]
  })

  export const create = docId({account: 'create'})

  export const path = (account: Doc): string => {
    return '/' + account._id
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: Doc): boolean => {
    return !!docId(doc._id)
  }

  export const idFromDocId = (account: DocId): Id => {
    const aparts = docId(account)
    if (!aparts) {
      throw new Error('not an account id: ' + account)
    }
    return aparts.account
  }

  export const doc = (account: Account): Doc => {
    const _id = docId({ account: makeid() })
    return { _id, ...account }
  }

  export const createIndices = (db: PouchDB.Database<any>) => {
    return db.createIndex({
      index: {
        fields: ['institution']
      }
    })
  }

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type CACHE_SET = 'account/cacheSet'
  export const CACHE_SET = 'account/cacheSet'
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
