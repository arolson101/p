import * as docURI from 'docuri'
import { AccountId } from './account'
import { makeid } from '../util'

export interface Transaction {
  time: Date
  payee: string
  amount: number
}

export type TransactionDoc = PouchDB.Core.Document<Transaction>;

export type TransactionId = '<transaction>' | makeid | '' | '\uffff'

export class Transaction {
  static readonly docId = docURI.route<{account: AccountId, time: string}, TransactionId>('transaction/:account/:time')
  static readonly startkeyForAccount = (account: AccountId) => Transaction.docId({account, time: ''})
  static readonly endkeyForAccount = (account: AccountId) => Transaction.docId({account, time: '\uffff'})
  static readonly allForAccount = (account: AccountId): PouchDB.Selector => ({
    $and: [
      { _id: { $gt: Transaction.startkeyForAccount(account) } },
      { _id: { $lt: Transaction.endkeyForAccount(account) } }
    ]
  })

  static readonly doc = (account: AccountId, transaction: Transaction): TransactionDoc => {
    const time = transaction.time.valueOf().toString()
    const _id = Transaction.docId({account, time})
    return { _id, ...transaction }
  }
}
