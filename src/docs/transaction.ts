import * as docURI from 'docuri'
import { Bank } from './bank'
import { Account } from './account'

export interface Split {
  [categoryId: string]: number
}

export interface Transaction {
  time: Date
  payee: string
  amount: number
  split: Split
}

export namespace Transaction {
  export type DocId = 'transaction/:bankId/:accountId/:time'
  export type Doc = PouchDB.Core.Document<Transaction> & { _id: DocId; _rev?: string }
  export interface Params { bankId: Bank.Id, accountId: Account.Id, time: string }

  export const CHANGE_ACTION = 'db/TransactionChange'
  export const docId = docURI.route<Params, DocId>('transaction/:bankId/:accountId/:time')
  export const startkeyForAccount = (account: Account.Doc) => docId({ ...accountParts(account), time: ''})
  export const endkeyForAccount = (account: Account.Doc) => docId({ ...accountParts(account), time: ''}) + '\uffff'
  export const allForAccount = (account: Account.Doc): PouchDB.Selector => {
    return ({
      $and: [
        { _id: { $gt: startkeyForAccount(account) } },
        { _id: { $lt: endkeyForAccount(account) } }
      ]
    })
  }

  const accountParts = (account: Account.Doc) => {
    const aparts = Account.docId(account._id)
    if (!aparts) {
      throw new Error('invalid accountId: ' + account._id)
    }
    return aparts
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const doc = (account: Account.Doc, transaction: Transaction): Doc => {
    const time = transaction.time.valueOf().toString()
    const _id = docId({ ...accountParts(account), time })
    return { _id, ...transaction }
  }
}
