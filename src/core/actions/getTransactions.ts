import * as ofx4js from 'ofx4js'
import { defineMessages, FormattedMessage } from 'react-intl'
import { AppThunk, ThunkFcn } from '../state'
import { Bank, Account, Transaction } from '../docs'
import { createConnection, getFinancialAccount } from 'util/online'

type FormatMessage = (messageDescriptor: FormattedMessage.MessageDescriptor, values?: Object) => string

const messages = defineMessages({
  success: {
    id: 'getAccounts.success',
    defaultMessage: 'Downloaded {count} transactions from server'
  },
  empty: {
    id: 'getAccounts.empty',
    defaultMessage: 'Server did not send a transaction list!'
  }
})

type GetTransactionsArgs = { bank: Bank.View, account: Account.View, start: Date, end: Date, formatMessage: FormatMessage }
export namespace getTransactions { export type Fcn = ThunkFcn<GetTransactionsArgs, string> }
export const getTransactions: AppThunk<GetTransactionsArgs, string> = ({bank, account, start, end, formatMessage}) =>
  async (dispatch, getState): Promise<string> => {
    try {
      const service = createConnection(bank, formatMessage)
      const bankAccount = getFinancialAccount(service, bank, account, formatMessage)
      const bankStatement = await bankAccount.readStatement(start, end)
      const transactionList = bankStatement.getTransactionList()
      if (transactionList) {
        const { db: { current } } = getState()
        if (!current) { throw new Error('no db') }
        const existingTransactions = (await current.db.allDocs({
          include_docs: true,
          startkey: Transaction.startkeyForAccount(account, start),
          endkey: Transaction.endkeyForAccount(account, end)
        })).rows.map(result => result.doc! as Transaction.Doc)
        const newTransactions = transactionList.getTransactions() || []
        const changes: ChangeSet = new Set()
        for (let newTransaction of newTransactions) {
          const time = newTransaction.getDatePosted()
          if (time < start || time >= end) {
            // not sure why bank would give us transactions outside of our date range, but it happens!
            continue
          }
          const existingTransaction = findMatchingTransaction(existingTransactions, newTransaction)
          if (!existingTransaction) {
            const transaction = Transaction.doc(account, {
              serverid: newTransaction.getId(),
              time: time.valueOf(),
              type: ofx4js.domain.data.common.TransactionType[newTransaction.getTransactionType()],
              name: newTransaction.getName(),
              memo: newTransaction.getMemo(),
              amount: newTransaction.getAmount(),
              split: {}
            })
            changes.add(transaction)
          }
        }
        // const balance = bankStatement.getLedgerBalance()
        await current.db.bulkDocs(Array.from(changes))
        return formatMessage(messages.success, {count: changes.size})
      } else {
        return formatMessage(messages.empty)
      }
    } catch (ex) {
      throw new Error(ex.message)
    }
  }

const findMatchingTransaction = (existingTransactions: Transaction.Doc[], newTransaction: ofx4js.domain.data.common.Transaction) => {
  const id = newTransaction.getId()
  return existingTransactions.find(existingTransaction => existingTransaction.serverid === id)
}
