import { defineMessages, FormattedMessage } from 'react-intl'
import { AppThunk, ThunkFcn } from '../state/index'
import { Bank, Account } from '../docs/index'
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

type GetAccountsArgs = { bank: Bank.View, formatMessage: FormatMessage }
export namespace getAccounts { export type Fcn = ThunkFcn<GetAccountsArgs, string> }
export const getAccounts: AppThunk<GetAccountsArgs, string> = ({bank, formatMessage}) =>
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
        const changes: AnyDocument[] = []
        const nextBank: Bank.Doc = { ...bank.doc, accounts: [...bank.doc.accounts] }

        for (let accountProfile of accountProfiles) {
          const accountName = accountProfile.getDescription()
            || (accountProfiles.length === 1 ? bank.doc.name : `${bank.doc.name} ${accountProfiles.indexOf(accountProfile)}`)
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
            color: Account.generateColor(accountType),
            type: accountType,
            number: accountNumber,
            bankid,
            key,
            visible: true
          }

          const existingAccount = findExistingAccount(bank, accountNumber, accountType)
          if (!existingAccount) {
            res.push(formatMessage(messages.accountAdded, account))
            const doc = Account.doc(bank.doc, account, lang)
            nextBank.accounts.push(doc._id)
            changes.push(doc)
          } else {
            res.push(formatMessage(messages.accountExists, account))
          }
        }

        if (changes.length > 0) {
          await current.db.bulkDocs([...changes, nextBank])
        }
      }
      return res.join('\n')

    } catch (ex) {
      res.push(ex.message)
      throw new Error(res.join('\n'))
    }
  }

const findExistingAccount = (bank: Bank.View, num: string, type: Account.Type): undefined | Account.View => {
  for (let account of bank.accounts) {
    if (account.doc.number === num && account.doc.type === type) {
      return account
    }
  }
  return undefined
}
