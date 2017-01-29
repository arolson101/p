import * as docURI from 'docuri'
import { defineMessages } from 'react-intl'
import { makeid, Lookup } from '../util'
import { Bank } from './Bank'
import { Transaction } from './Transaction'
import { DocCache, TCacheSetAction } from './index'

export interface Account {
  name: string
  type: Account.Type
  number: string
  visible: boolean
  bankid: string
  key: string
  ledgerBalance?: number
  ledgerBalanceDate?: number
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
      id: 'Account.Type.CHECKING',
      defaultMessage: 'Checking'
    },
    SAVINGS: {
      id: 'Account.Type.SAVINGS',
      defaultMessage: 'Savings'
    },
    MONEYMRKT: {
      id: 'Account.Type.MONEYMRKT',
      defaultMessage: 'Money Market'
    },
    CREDITLINE: {
      id: 'Account.Type.CREDITLINE',
      defaultMessage: 'Credit Line'
    },
    CREDITCARD: {
      id: 'Account.Type.CREDITCARD',
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

  export type Id = ':accountId' | 'create' | makeid
  export type DocId = 'account/:bankId/:accountId'
  export type Doc = TDocument<Account, DocId>
  export interface Params { bankId: Bank.Id, accountId: Id }
  export const docId = docURI.route<Params, DocId>('account/:bankId/:accountId')

  export type View = {
    doc: Doc
    transactions: Transaction.View[]
  }

  export const buildView = (doc: Doc, cache: DocCache): View => {
    const startkey = Transaction.startkeyForAccount(doc)
    const endkey = Transaction.endkeyForAccount(doc)
    let currentTotal = 0
    const transactions = Array.from(cache.transactions.values())
      .filter(transaction => (startkey < transaction._id && transaction._id < endkey))
      .map(transaction => {
        const view = Transaction.buildView(transaction, currentTotal)
        currentTotal += transaction.amount
        return view
      })

    return ({
      doc,
      transactions
    })
  }

  export namespace routes {
    export const create = 'account/:bankId/create'
    export const view = 'account/:bankId/:accountId'
    export const edit = 'account/:bankId/:accountId/edit'
    export const del = 'account/:bankId/:accountId/delete'
  }

  export namespace to {
    export const create = (bank: Bank.Doc) => {
      const iparams = Bank.docId(bank._id)
      if (!iparams) { throw new Error('not a bank docId: ' + bank._id) }
      const path = docId({ accountId: 'create', bankId: iparams.bankId })
      return '/' + path
    }

    export const view = (account: Doc): string => {
      return '/' + account._id
    }

    export const edit = (account: Doc): string => {
      return '/' + account._id + '/edit'
    }

    export const del = (account: Doc): string => {
      return '/' + account._id + '/delete'
    }
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const idFromDocId = (account: DocId): Id => {
    const aparts = docId(account)
    if (!aparts) {
      throw new Error('not an account id: ' + account)
    }
    return aparts.accountId
  }

  export const doc = (bank: Bank.Doc, account: Account, lang: string): Doc => {
    const iparams = Bank.docId(bank._id)
    if (!iparams) {
      throw new Error('invalid bankId: ' + bank._id)
    }
    const _id = docId({
      bankId: iparams.bankId,
      accountId: makeid(account.name, lang)
    })
    return { _id, ...account }
  }

  export const getBank = (account: Account.Doc): Bank.DocId => {
    const aparams = docId(account._id)
    if (!aparams) {
      throw new Error('invalid accountId: ' + account._id)
    }
    return Bank.docId(aparams)
  }

  export const createIndices = (db: PouchDB.Database<any>) => {
    // return db.createIndex({
    //   index: {
    //     fields: ['bank']
    //   }
    // })
  }

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type CACHE_SET = 'account/cacheSet'
  export const CACHE_SET = 'account/cacheSet'
  export type CacheSetAction = TCacheSetAction<CACHE_SET, Cache>
  export const cacheSetAction = (cache: Cache): CacheSetAction => ({
    type: CACHE_SET,
    cache
  })
}