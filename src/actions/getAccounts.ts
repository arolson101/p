import { defineMessages, FormattedMessage } from 'react-intl'
import { AppThunk } from '../state'
import { wait } from '../util'
import { Institution, Account } from '../docs'
import * as ofx4js from 'ofx4js'

import FinancialInstitutionImpl = ofx4js.client.impl.FinancialInstitutionImpl
import BaseFinancialInstitutionData = ofx4js.client.impl.BaseFinancialInstitutionData
import OFXV1Connection = ofx4js.client.net.OFXV1Connection
import AccountProfile = ofx4js.domain.data.signup.AccountProfile

type FormatMessage = (messageDescriptor: FormattedMessage.MessageDescriptor, values?: Object) => string

export const messages = defineMessages({
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
  error: {
    id: 'getAccounts.error',
    defaultMessage: 'Error getting account list from server:'
  },
  success: {
    id: 'getAccounts.success',
    defaultMessage: 'Downloaded account list from server:'
  },
  accountInfo: {
    id: 'getAccounts.accountInfo',
    defaultMessage: '{number} - {name} ({type})'
  },
  noaccounts: {
    id: 'getAccounts.noaccounts',
    defaultMessage: 'No accounts'
  }
})

export const getAccounts = (institution: Institution.Doc, formatMessage: FormatMessage): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().db
    if (!current) { throw new Error('no db') }
    const res = []
    try {
      const { fid, org, ofx, name, login } = institution
      if (!fid) { throw new Error(formatMessage(messages.nofid)) }
      if (!org) { throw new Error(formatMessage(messages.noorg)) }
      if (!ofx) { throw new Error(formatMessage(messages.noofx)) }
      if (!name) { throw new Error(formatMessage(messages.noname)) }
      if (!login) { throw new Error(formatMessage(messages.nousername)) }
      const { username, password } = login
      if (!username) { throw new Error(formatMessage(messages.nousername)) }
      if (!password) { throw new Error(formatMessage(messages.nopassword)) }
      const accounts = await readAccountProfiles({ fid, org, ofx, name, username, password })
      res.push(formatMessage(messages.success))
      if (accounts.length === 0) {
        res.push(formatMessage(messages.noaccounts))
      } else {
        for (let account of accounts) {
          res.push(formatMessage(messages.accountInfo, account))
        }
      }
    } catch (ex) {
      res.push(formatMessage(messages.error), ex.message)
    }
    return res.join('\n')
  }

export interface ReadAccountProfilesParams {
  fid: string
  org: string
  ofx: string
  name: string

  username: string
  password: string
}

const readAccountProfiles = async (params: ReadAccountProfilesParams): Promise<Account[]> => {
  let DefaultApplicationContext = ofx4js.client.context.DefaultApplicationContext
  let OFXApplicationContextHolder = ofx4js.client.context.OFXApplicationContextHolder
  OFXApplicationContextHolder.setCurrentContext(new DefaultApplicationContext('QWIN', '2300'))

  let bank = new BaseFinancialInstitutionData()
  bank.setFinancialInstitutionId(params.fid)
  bank.setOrganization(params.org)
  bank.setOFXURL(params.ofx)
  bank.setName(params.name)

  let connection = new OFXV1Connection()

  // NOTE: making an OFX connection will fail security checks in browsers.  On Chrome you
  // can make it run with the "--disable-web-security" command-line option
  // e.g. (OSX): open /Applications/Google\ Chrome.app --args --disable-web-security
  let service = new FinancialInstitutionImpl(bank, connection)
  let profiles = await service.readAccountProfiles(params.username, params.password)
  return convertAccountList(profiles)
}

const convertAccountType = (acctType: ofx4js.domain.data.banking.AccountType): Account.Type => {
  let str = ofx4js.domain.data.banking.AccountType[acctType]
  console.assert(str in Account.Type)
  return str as Account.Type
}

const convertAccountList = (accountProfiles: AccountProfile[]): Account[] => {
  return accountProfiles.map(convertAccount).filter(acct => acct !== undefined) as Account[]
}

const convertAccount = (accountProfile: AccountProfile): Account | undefined => {
  if (accountProfile.getBankSpecifics()) {
    return {
      name: accountProfile.getDescription(),
      type: convertAccountType(accountProfile.getBankSpecifics().getBankAccount().getAccountType()),
      number: accountProfile.getBankSpecifics().getBankAccount().getAccountNumber(),
      visible: true
    } as Account
  } else if (accountProfile.getCreditCardSpecifics()) {
    return {
      name: accountProfile.getDescription(),
      type: Account.Type.CREDITCARD,
      number: accountProfile.getCreditCardSpecifics().getCreditCardAccount().getAccountNumber(),
      visible: true
    } as Account
  } else if (accountProfile.getInvestmentSpecifics()) {
    // TODO: support investment accounts
    console.warn('investment account not supported: ', accountProfile)
  }
}
