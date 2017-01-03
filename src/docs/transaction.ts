import { randomBytes } from 'crypto'
import * as docURI from 'docuri'
import { Bank } from './bank'
import { Account } from './account'

export interface Split {
  [categoryId: string]: number
}

export interface Transaction {
  serverid?: string
  time: Date
  name: string
  memo: string
  amount: number
  split: Split
}

export namespace Transaction {
  export type DocId = 'transaction/:bankId/:accountId/:time'
  export type Doc = PouchDB.Core.Document<Transaction> & { _id: DocId; _rev?: string }
  export interface Params { bankId: Bank.Id, accountId: Account.Id, time: string }

  export const CHANGE_ACTION = 'db/TransactionChange'
  export const docId = docURI.route<Params, DocId>('transaction/:bankId/:accountId/:time')
  export const startkeyForAccount = (account: Account.Doc, time?: Date) =>
    docId({ ...accountParts(account), time: time ? timeKey(time) : ''})
  export const endkeyForAccount = (account: Account.Doc, time?: Date) =>
    docId({ ...accountParts(account), time: time ? timeKey(time) : ''}) + '\uffff'
  export const allForAccount = (account: Account.Doc, start?: Date, end?: Date): PouchDB.Selector => {
    return ({
      $and: [
        { _id: { $gt: startkeyForAccount(account, start) } },
        { _id: { $lt: endkeyForAccount(account, end) } }
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

  const timeKey = (time: Date): string => {
    return time.valueOf().toString()
  }

  export const doc = (account: Account.Doc, transaction: Transaction): Doc => {
    const time = timeKey(transaction.time) + randomBytes(4).toString('hex')
    const _id = docId({ ...accountParts(account), time })
    return { _id, ...transaction }
  }
}
