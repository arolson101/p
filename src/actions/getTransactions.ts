import { defineMessages, FormattedMessage } from 'react-intl'
import { AppThunk, CurrentDb } from '../state'
import { Bank, Account, Transaction } from '../docs'
import { createConnection, getFinancialAccount } from './online'

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

export const getTransactions = (bank: Bank.Doc, account: Account.Doc, start: Date, end: Date, formatMessage: FormatMessage): AppThunk =>
  async (dispatch, getState): Promise<string> => {
    const res = []
    try {
      const service = createConnection(bank, formatMessage)
      const bankAccount = getFinancialAccount(service, bank, account, formatMessage)

      const statement = await bankAccount.readStatement(start, end)
      const transactionList = statement.getTransactionList()
      if (transactionList) {
        const { db: { current } } = getState()
        if (!current) { throw new Error('no db') }
        const existingTransactions = await getExistingTransactions(current, account, start, end)
        const newTransactions = transactionList.getTransactions() || []
        const changes: PouchDB.Core.Document<any>[] = []
        for (let newTransaction of newTransactions) {
          const time = newTransaction.getDatePosted()
          if (time < start || time >= end) {
            // not sure why bank would give us transactions outside of our date range, but it happens!
            continue
          }
          const transaction = findMatchingTransaction(existingTransactions, newTransaction)
          if (!transaction) {
            const transaction: Transaction = {
              serverid: newTransaction.getId(),
              time,
              name: newTransaction.getName(),
              memo: newTransaction.getMemo(),
              amount: newTransaction.getAmount(),
              split: {}
            }
            const doc = Transaction.doc(account, transaction)
            console.assert(doc.time >= start)
            console.assert(doc.time < end)
            changes.push(doc)
          }
        }

        await current.db.bulkDocs(changes)
        return formatMessage(messages.success, {count: changes.length})
      } else {
        return formatMessage(messages.empty)
      }
    } catch (ex) {
      throw new Error(ex.message)
    }
  }

const getExistingTransactions = async (current: CurrentDb, account: Account.Doc, start: Date, end: Date): Promise<Transaction[]> => {
  const startkey = Transaction.startkeyForAccount(account, start)
  const endkey = Transaction.endkeyForAccount(account, end)
  const existingTransactions = await current.db.allDocs({ startkey, endkey, include_docs: true })
  return existingTransactions.rows.map(row => row.doc)
}

const findMatchingTransaction = (existingTransactions: Transaction[], newTransaction: ofx4js.domain.data.common.Transaction) => {
  const id = newTransaction.getId()
  return existingTransactions.find(existingTransaction => existingTransaction.serverid === id)
}
