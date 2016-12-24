import { defineMessages, FormattedMessage } from 'react-intl'
import { AppThunk } from '../state'
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
  validationFailed: {
    id: 'getAccounts.validationFailed',
    defaultMessage: 'Error in institution settings:'
  },
  error: {
    id: 'getAccounts.error',
    defaultMessage: 'Error getting account list from server:'
  },
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
  noaccounts: {
    id: 'getAccounts.noaccounts',
    defaultMessage: 'No accounts'
  }
})

export const getAccounts = (institution: Institution.Doc, formatMessage: FormatMessage): AppThunk =>
  async (dispatch, getState) => {
    const res = []
    let validated = false
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
      validated = true
      res.push(formatMessage(messages.success))
      if (accounts.length === 0) {
        res.push(formatMessage(messages.noaccounts))
      } else {
        const { db: { current }, i18n: { lang } } = getState()
        if (!current) { throw new Error('no db') }
        const changes: PouchDB.Core.Document<any>[] = []
        for (let account of accounts) {
          if (!accountExists(current.cache.accounts, institution, account.number, account.type)) {
            res.push(formatMessage(messages.accountAdded, account))
            const info: Account = {
              ...account,
              institution: institution._id,
              visible: true
            }
            const doc = Account.doc(info, lang)
            institution.accounts.push(doc._id)
            changes.push(doc)
          } else {
            res.push(formatMessage(messages.accountExists, account))
          }
        }

        if (changes.length > 0) {
          await current.db.bulkDocs([...changes, institution])
        }
      }
      return res.join('\n')

    } catch (ex) {
      res.push(formatMessage(validated ? messages.error : messages.validationFailed))
      res.push(ex.message)
      throw new Error(res.join('\n'))
    }
  }

const accountExists = (cache: Account.Cache, institution: Institution.Doc, num: string, type: Account.Type): boolean => {
  for (let account of cache.values()) {
    if (account.institution === institution._id && account.number === num && account.type === type) {
      return institution.accounts.indexOf(account._id) !== -1
    }
  }
  return false
}

interface ReadAccountProfilesParams {
  fid: string
  org: string
  ofx: string
  name: string

  username: string
  password: string
}

interface AccountInfo {
  type: Account.Type
  name: string
  number: string
}

const readAccountProfiles = async (params: ReadAccountProfilesParams): Promise<AccountInfo[]> => {
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
  if (!(str in Account.Type)) {
    console.warn(`unknown account type: {str}`)
    str = Account.Type.CHECKING
  }
  return str as Account.Type
}

const convertAccountList = (accountProfiles: AccountProfile[]): AccountInfo[] => {
  return accountProfiles.map(convertAccount).filter(acct => acct !== undefined) as AccountInfo[]
}

const convertAccount = (accountProfile: AccountProfile): AccountInfo | undefined => {
  if (accountProfile.getBankSpecifics()) {
    return {
      name: accountProfile.getDescription(),
      type: convertAccountType(accountProfile.getBankSpecifics().getBankAccount().getAccountType()),
      number: accountProfile.getBankSpecifics().getBankAccount().getAccountNumber()
    }
  } else if (accountProfile.getCreditCardSpecifics()) {
    return {
      name: accountProfile.getDescription(),
      type: Account.Type.CREDITCARD,
      number: accountProfile.getCreditCardSpecifics().getCreditCardAccount().getAccountNumber()
    }
  } else if (accountProfile.getInvestmentSpecifics()) {
    // TODO: support investment accounts
    console.warn('investment account not supported: ', accountProfile)
  }
}
