import * as docURI from 'docuri'
import { Account } from './account'
import { makeid } from '../util'

export interface Transaction {
  time: Date
  payee: string
  amount: number
}

export namespace Transaction {
  export type Doc = PouchDB.Core.Document<Transaction>
  export type Id = '<transaction>' | makeid | '' | '\uffff'
}

export class Transaction {
  static readonly docId = docURI.route<{account: Account.Id, time: string}, Transaction.Id>('transaction/:account/:time')
  static readonly startkeyForAccount = (account: Account.Id) => Transaction.docId({account, time: ''})
  static readonly endkeyForAccount = (account: Account.Id) => Transaction.docId({account, time: ''}) + '\uffff'
  static readonly allForAccount = (account: Account.Doc): PouchDB.Selector => {
    const accountId = Account.idFromDocId(account._id)
    return ({
      _id: {
        $and: [
          { $gt: Transaction.startkeyForAccount(accountId) },
          { $lt: Transaction.endkeyForAccount(accountId) }
        ]
      }
    })
  }

  static readonly doc = (account: Account.Id, transaction: Transaction): Transaction.Doc => {
    const time = transaction.time.valueOf().toString()
    const _id = Transaction.docId({account, time})
    return { _id, ...transaction }
  }
}
