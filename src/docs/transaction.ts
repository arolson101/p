import * as docURI from 'docuri'
import { Account } from './account'

export interface Transaction {
  time: Date
  payee: string
  amount: number
}

export namespace Transaction {
  export type DocId = '/transaction/:account/:time'
  export type Doc = PouchDB.Core.Document<Transaction> & { _id: DocId }
}

export class Transaction {
  static readonly docId = docURI.route<{account: Account.Id, time: string}, Transaction.DocId>('transaction/:account/:time')
  static readonly startkeyForAccount = (account: Account.Id) => Transaction.docId({account, time: ''})
  static readonly endkeyForAccount = (account: Account.Id) => Transaction.docId({account, time: ''}) + '\uffff'
  static readonly allForAccount = (account: Account.Doc): PouchDB.Selector => {
    const accountId = Account.idFromDocId(account._id)
    return ({
      $and: [
        { _id: { $gt: Transaction.startkeyForAccount(accountId) } },
        { _id: { $lt: Transaction.endkeyForAccount(accountId) } }
      ]
    })
  }

  static readonly isDocId = (id: string): boolean => {
    return !!Transaction.docId(id as Transaction.DocId)
  }

  static readonly doc = (account: Account.Id, transaction: Transaction): Transaction.Doc => {
    const time = transaction.time.valueOf().toString()
    const _id = Transaction.docId({account, time})
    return { _id, ...transaction }
  }
}
