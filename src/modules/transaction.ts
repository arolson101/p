import * as docURI from 'docuri'
import { AccountDoc, createAccountDocId } from './account'

export interface Transaction {
  time: Date
  payee: string
  amount: number
}

export const createTransactionDocId = docURI.route<
  {
    institution: string,
    account: string,
    time: string
  }>('transaction/:institution/:account/:time')
export type TransactionDoc = PouchDB.Core.Document<Transaction>;

export const transactionDoc = (account: AccountDoc, transaction: Transaction): TransactionDoc => {
  const aroute = createAccountDocId(account._id)
  if (!aroute) {
    throw new Error(`invalid account id: ${account._id}`)
  }
  const time = transaction.time.valueOf().toString()
  const info = Object.assign({}, aroute, { time })
  const _id = createTransactionDocId(info)
  return Object.assign({ _id }, transaction)
}

// export const transactionsForAccount = (
//     db: PouchDB.Database<{}>,
//     account: string,
//     start: Date,
//     end: Date
//   ): Promise<AccountDoc[]> => {
//   const aroute = createAccountDocId(account)
//   if (!aroute) {
//     throw new Error('invalid account id: ' + account)
//   }
//   const startkey = createTransactionDocId(Object.assign({ time: start.valueOf().toString() }, aroute))
//   const endkey = createTransactionDocId(Object.assign({ time: end.valueOf().toString() }, aroute))
//   return db.allDocs({startkey, endkey})
// }
