import { defineMessages, FormattedMessage } from 'react-intl'
import { AppThunk } from '../state'
import { Bank, Account } from '../docs'
import { createConnection, checkLogin, getBankAccountDetails } from './online'

type FormatMessage = (messageDescriptor: FormattedMessage.MessageDescriptor, values?: Object) => string

const messages = defineMessages({
  success: {
    id: 'getAccounts.success',
    defaultMessage: 'Downloaded {count} transactions from server'
  }
})

export const getTransactions = (bank: Bank.Doc, account: Account.Doc, start: Date, end: Date, formatMessage: FormatMessage): AppThunk =>
  async (dispatch, getState) => {
    const res = []
    try {
      const service = createConnection(bank, formatMessage)
      const { username, password } = checkLogin(bank, formatMessage)
      const accountDetails = getBankAccountDetails(bank, account, formatMessage)
      const bankAccount = service.loadBankAccount(accountDetails, username, password)
      const statement = await bankAccount.readStatement(start, end)
      console.log(statement)
      const transactions = statement.getTransactionList() ? statement.getTransactionList().getTransactions() : []
      const count = transactions.length
      res.push(formatMessage(messages.success, {count}))
      return res.join('\n')

    } catch (ex) {
      res.push(ex.message)
      throw new Error(res.join('\n'))
    }
  }
