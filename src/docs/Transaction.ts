import { randomBytes } from 'crypto'
import * as docURI from 'docuri'
import { Bank } from './Bank'
import { Account } from './Account'
import { Statement } from './Statement'

export interface Split {
  [categoryId: string]: number
}

export interface Transaction {
  serverid?: string
  time: number
  type: string
  name: string
  memo: string
  amount: number
  statement?: Statement.DocId
  split: Split
}

export namespace Transaction {
  export type DocId = 'transaction/:bankId/:accountId/:txId'
  export type Doc = PouchDB.Core.Document<Transaction> & { _id: DocId; _rev?: string }
  export interface Params { bankId: Bank.Id, accountId: Account.Id, txId: string }
  export const docId = docURI.route<Params, DocId>('transaction/:bankId/:accountId/:txId')
  export const startkeyForAccount = (account: Account.Doc, time?: Date) =>
    docId({ ...accountParts(account), txId: time ? timeKey(time) : ''})
  export const endkeyForAccount = (account: Account.Doc, time?: Date) =>
    docId({ ...accountParts(account), txId: time ? timeKey(time) : ''}) + '\uffff'
  export const allForAccount = (account: Account.Doc, start?: Date, end?: Date): PouchDB.Selector => {
    return ({
      $and: [
        { _id: { $gt: startkeyForAccount(account, start) } },
        { _id: { $lt: endkeyForAccount(account, end) } }
      ]
    })
  }

  export namespace routes {
    export const view = 'transaction/:bankId/:accountId/:txId'
    export const edit = 'transaction/:bankId/:accountId/:txId/edit'
  }

  export namespace to {
    export const view = (transaction: Doc): string => {
      return '/' + transaction._id
    }

    export const edit = (transaction: Doc): string => {
      return '/' + transaction._id + '/edit'
    }
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
    const txId = transaction.time.toString() + randomBytes(4).toString('hex')
    const _id = docId({ ...accountParts(account), txId })
    return { _id, ...transaction }
  }
}
