import { defineMessages, FormattedMessage } from 'react-intl'
import { AppThunk } from '../state'
import { Bank, Account } from '../docs'
import { createConnection, checkLogin, toAccountType } from './online'

type FormatMessage = (messageDescriptor: FormattedMessage.MessageDescriptor, values?: Object) => string

const messages = defineMessages({
  success: {
    id: 'getAccounts.success',
    defaultMessage: 'Downloaded account list from server:'
  },
  accountExists: {
    id: 'getAccounts.accountExists',
    defaultMessage: '{number} - {name} ({type}) (already exists)'
  },
  accountAdded: {
    id: 'getAccounts.accountAdded',
    defaultMessage: '{number} - {name} ({type}) (created)'
  },
  setBankId: {
    id: 'getAccounts.setBankId',
    defaultMessage: '{number} - {name} ({type}) (updated bankid to {bankid})'
  },
  investmentAccountNotSupported: {
    id: 'getAccounts.investmentAccountNotSupported',
    defaultMessage: 'Investment account not supported: {name}'
  },
  unknownAccountNotSupported: {
    id: 'getAccounts.unknownAccountNotSupported',
    defaultMessage: 'Account not supported: {name}'
  },
  noaccounts: {
    id: 'getAccounts.noaccounts',
    defaultMessage: 'No accounts'
  }
})

export const getAccounts = (bank: Bank.Doc, formatMessage: FormatMessage): AppThunk =>
  async (dispatch, getState) => {
    const res = []
    try {
      let service = createConnection(bank, formatMessage)
      let { username, password } = checkLogin(bank, formatMessage)
      let accountProfiles = await service.readAccountProfiles(username, password)

      res.push(formatMessage(messages.success))
      if (accountProfiles.length === 0) {
        res.push(formatMessage(messages.noaccounts))
      } else {
        const { db: { current }, i18n: { lang } } = getState()
        if (!current) { throw new Error('no db') }
        const changes: PouchDB.Core.Document<any>[] = []

        for (let accountProfile of accountProfiles) {
          const accountName = accountProfile.getDescription()
          let accountType: Account.Type
          let accountNumber: string
          let bankid = ''
          let key = ''

          if (accountProfile.getBankSpecifics()) {
            const bankSpecifics = accountProfile.getBankSpecifics()
            const bankAccount = bankSpecifics.getBankAccount()
            bankid = bankAccount.getBankId()
            bankAccount.getBranchId()
            accountType = toAccountType(bankAccount.getAccountType())
            accountNumber = bankAccount.getAccountNumber()

          } else if (accountProfile.getCreditCardSpecifics()) {
            const creditCardSpecifics = accountProfile.getCreditCardSpecifics()
            const creditCardAccount = creditCardSpecifics.getCreditCardAccount()
            accountType = Account.Type.CREDITCARD
            accountNumber = creditCardAccount.getAccountNumber()
            key = creditCardAccount.getAccountKey()

          } else if (accountProfile.getInvestmentSpecifics()) {
            // TODO: support investment accounts
            res.push(formatMessage(messages.investmentAccountNotSupported, {accountName}))
            continue

          } else {
            res.push(formatMessage(messages.unknownAccountNotSupported, {accountName}))
            continue
          }

          const account: Account = {
            name: accountName,
            type: accountType,
            number: accountNumber,
            bankid,
            key,
            visible: true
          }

          const existingAccount = findExistingAccount(current.cache.accounts, bank, accountNumber, accountType)
          if (!existingAccount) {
            res.push(formatMessage(messages.accountAdded, account))
            const doc = Account.doc(bank, account, lang)
            bank.accounts.push(doc._id)
            changes.push(doc)
          } else if (existingAccount.bankid !== bankid) {
            existingAccount.bankid = bankid
            changes.push(existingAccount)
            res.push(formatMessage(messages.setBankId, existingAccount))
          } else {
            res.push(formatMessage(messages.accountExists, account))
          }
        }

        if (changes.length > 0) {
          await current.db.bulkDocs([...changes, bank])
        }
      }
      return res.join('\n')

    } catch (ex) {
      res.push(ex.message)
      throw new Error(res.join('\n'))
    }
  }

const findExistingAccount = (cache: Account.Cache, bank: Bank.Doc, num: string, type: Account.Type): undefined | Account.Doc => {
  for (let account of cache.values()) {
    if (Account.getBank(account) === bank._id && account.number === num && account.type === type) {
      console.assert(bank.accounts.indexOf(account._id) !== -1)
      return account
    }
  }
  return undefined
}
