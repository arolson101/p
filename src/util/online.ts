import * as ofx4js from 'ofx4js'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Bank, Account } from '../docs/index'

import FinancialInstitutionImpl = ofx4js.client.impl.FinancialInstitutionImpl
import BaseFinancialInstitutionData = ofx4js.client.impl.BaseFinancialInstitutionData
import OFXV1Connection = ofx4js.client.net.OFXV1Connection
import FinancialInstitutionAccount = ofx4js.client.FinancialInstitutionAccount

type FormatMessage = (messageDescriptor: FormattedMessage.MessageDescriptor, values?: Object) => string

const messages = defineMessages({
  nofid: {
    id: 'getAccounts.nofid',
    defaultMessage: "'fid' is not set"
  },
  noorg: {
    id: 'getAccounts.noorg',
    defaultMessage: "'org' is not set"
  },
  noofx: {
    id: 'getAccounts.noofx',
    defaultMessage: "'ofx' is not set"
  },
  noname: {
    id: 'getAccounts.noname',
    defaultMessage: "'name' is not set"
  },
  nologin: {
    id: 'getAccounts.nologin',
    defaultMessage: "'login' is not set"
  },
  nousername: {
    id: 'getAccounts.nousername',
    defaultMessage: "'username' is not set"
  },
  nopassword: {
    id: 'getAccounts.nopassword',
    defaultMessage: "'password' is not set"
  },
  noAccountNumber: {
    id: 'getAccounts.noAccountNumber',
    defaultMessage: "'accountNumber' is not set"
  },
  nobankid: {
    id: 'getAccounts.noRoutingNumber',
    defaultMessage: "'routingNumber' is not set"
  }
})

export const createConnection = (bank: Bank.Doc, formatMessage: FormatMessage): FinancialInstitutionImpl => {
  let DefaultApplicationContext = ofx4js.client.context.DefaultApplicationContext
  let OFXApplicationContextHolder = ofx4js.client.context.OFXApplicationContextHolder
  OFXApplicationContextHolder.setCurrentContext(new DefaultApplicationContext('QWIN', '2300'))

  const { fid, org, ofx, name } = bank
  if (!fid) { throw new Error(formatMessage(messages.nofid)) }
  if (!org) { throw new Error(formatMessage(messages.noorg)) }
  if (!ofx) { throw new Error(formatMessage(messages.noofx)) }
  if (!name) { throw new Error(formatMessage(messages.noname)) }

  let fiData = new BaseFinancialInstitutionData()
  fiData.setFinancialInstitutionId(fid)
  fiData.setOrganization(org)
  fiData.setOFXURL(ofx)
  fiData.setName(name)

  let connection = new OFXV1Connection()

  // NOTE: making an OFX connection will fail security checks in browsers.  On Chrome you
  // can make it run with the "--disable-web-security" command-line option
  // e.g. (OSX): open /Applications/Google\ Chrome.app --args --disable-web-security
  const service = new FinancialInstitutionImpl(fiData, connection)
  return service
}

interface Login {
  username: string
  password: string
}

export const checkLogin = (bank: Bank.Doc, formatMessage: FormatMessage): Login => {
  const { login } = bank
  if (!login) { throw new Error(formatMessage(messages.nologin)) }
  const { username, password } = login
  if (!username) { throw new Error(formatMessage(messages.nousername)) }
  if (!password) { throw new Error(formatMessage(messages.nopassword)) }
  return { username, password }
}

export const toAccountType = (acctType: ofx4js.domain.data.banking.AccountType): Account.Type => {
  let str = ofx4js.domain.data.banking.AccountType[acctType]
  if (!(str in Account.Type)) {
    console.warn(`unknown account type: {str}`)
    str = Account.Type.CHECKING
  }
  return str as Account.Type
}

export const fromAccountType = (str: Account.Type): ofx4js.domain.data.banking.AccountType => {
  if (!(str in ofx4js.domain.data.banking.AccountType)) {
    console.warn(`unknown account type: {str}`)
    str = Account.Type.CHECKING
  }
  return (ofx4js.domain.data.banking.AccountType as any)[str]
}

export const getFinancialAccount = (service: FinancialInstitutionImpl,
                                    bank: Bank.Doc,
                                    account: Account.Doc,
                                    formatMessage: FormatMessage): FinancialInstitutionAccount => {
  const { username, password } = checkLogin(bank, formatMessage)
  const accountNumber = account.number
  if (!accountNumber) { throw new Error(formatMessage(messages.noAccountNumber)) }
  let accountDetails

  switch (account.type) {
    case Account.Type.CHECKING:
    case Account.Type.SAVINGS:
    case Account.Type.CREDITLINE:
      const { bankid } = account
      if (!bankid) { throw new Error(formatMessage(messages.nobankid)) }
      accountDetails = new ofx4js.domain.data.banking.BankAccountDetails()
      accountDetails.setAccountNumber(accountNumber)
      accountDetails.setRoutingNumber(bankid)
      accountDetails.setAccountType(fromAccountType(account.type))
      return service.loadBankAccount(accountDetails, username, password)

    case Account.Type.CREDITCARD:
      accountDetails = new ofx4js.domain.data.creditcard.CreditCardAccountDetails()
      accountDetails.setAccountNumber(accountNumber)
      accountDetails.setAccountKey(account.key)
      return service.loadCreditCardAccount(accountDetails, username, password)

    default:
      throw new Error('unknown account type')
  }
}
