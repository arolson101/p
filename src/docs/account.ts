import * as docURI from 'docuri'
import { defineMessages } from 'react-intl'
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
}

export namespace Account {
  // see ofx4js.domain.data.banking.AccountType
  export type Type = 'CHECKING' | 'SAVINGS' | 'MONEYMRKT' | 'CREDITLINE' | 'CREDITCARD'
  export const Type = {
    CHECKING: 'CHECKING' as Type,
    SAVINGS: 'SAVINGS' as Type,
    MONEYMRKT: 'MONEYMRKT' as Type,
    CREDITLINE: 'CREDITLINE' as Type,
    CREDITCARD: 'CREDITCARD' as Type
  }

  export const messages = defineMessages({
    CHECKING: {
      id: 'acUpdate.CHECKING',
      defaultMessage: 'Checking'
    },
    SAVINGS: {
      id: 'acUpdate.SAVINGS',
      defaultMessage: 'Savings'
    },
    MONEYMRKT: {
      id: 'acUpdate.MONEYMRKT',
      defaultMessage: 'Money Market'
    },
    CREDITLINE: {
      id: 'acUpdate.CREDITLINE',
      defaultMessage: 'Credit Line'
    },
    CREDITCARD: {
      id: 'acUpdate.CREDITCARD',
      defaultMessage: 'Credit Card'
    }
  })

  export const icons = {
    [Account.Type.CHECKING]: 'fa fa-list-alt',
    [Account.Type.SAVINGS]: 'fa fa-money',
    [Account.Type.MONEYMRKT]: 'fa fa-money',
    [Account.Type.CREDITLINE]: 'fa fa-credit-card-alt',
    [Account.Type.CREDITCARD]: 'fa fa-credit-card'
  }

  export type Id = ':account' | 'create' | makeid | ''
  export type DocId = 'account/:institution/:account'
  export type Doc = PouchDB.Core.Document<Account> & { _id: DocId; _rev?: string }
  export interface Params { institution: Institution.Id, account: Id }
  export const docId = docURI.route<Params, DocId>('account/:institution/:account')
  export const startkey = 'account/'
  export const endkey = 'account/\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export namespace routes {
    export const create = 'account/:institution/create'
    export const read = 'account/:institution/:account'
    export const update = 'account/:institution/:account/update'
    export const del = 'account/:institution/:account/delete'
  }

  export namespace to {
    export const create = () => {
      return '/' + routes.create
    }

    export const read = (account: Doc): string => {
      return '/' + account._id
    }

    export const update = (account: Doc): string => {
      return '/' + account._id + '/update'
    }

    export const del = (account: Doc): string => {
      return '/' + account._id + '/delete'
    }
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

  export const doc = (account: Account, lang: string): Doc => {
    const iparams = Institution.docId(account.institution)
    if (!iparams) {
      throw new Error('invalid institution docid: ' + account.institution)
    }
    const _id = docId({
      institution: iparams.institution,
      account: makeid(account.name, lang)
    })
    return { _id, ...account }
  }

  export const createIndices = (db: PouchDB.Database<any>) => {
    // return db.createIndex({
    //   index: {
    //     fields: ['institution']
    //   }
    // })
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
