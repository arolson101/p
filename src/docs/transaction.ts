import * as docURI from 'docuri'
import { Account } from './account'

export interface Transaction {
  time: Date
  payee: string
  amount: number
}

export namespace Transaction {
  export type DocId = 'transaction/:account/:time'
  export type Doc = PouchDB.Core.Document<Transaction> & { _id: DocId }

  export const docId = docURI.route<{account: Account.Id, time: string}, DocId>('transaction/:account/:time')
  export const startkeyForAccount = (account: Account.Id) => docId({account, time: ''})
  export const endkeyForAccount = (account: Account.Id) => docId({account, time: ''}) + '\uffff'
  export const allForAccount = (accountDocId: Account.DocId): PouchDB.Selector => {
    const accountId = Account.idFromDocId(accountDocId)
    return ({
      $and: [
        { _id: { $gt: startkeyForAccount(accountId) } },
        { _id: { $lt: endkeyForAccount(accountId) } }
      ]
    })
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const doc = (account: Account.Id, transaction: Transaction): Doc => {
    const time = transaction.time.valueOf().toString()
    const _id = docId({account, time})
    return { _id, ...transaction }
  }
}
