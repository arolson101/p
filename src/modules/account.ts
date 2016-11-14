import * as docURI from 'docuri'
import { InstitutionDoc, createInstitutionDocId } from './institution'

// see ofx4js.domain.data.banking.AccountType
export enum AccountType {
  CHECKING,
  SAVINGS,
  MONEYMRKT,
  CREDITLINE,
  CREDITCARD,
}

export interface Account {
  name: string
  type: AccountType
  number: string
  visible: boolean
  balance: number
}

export const createAccountDocId = docURI.route<{institution: string, account: string}>('account/:institution/:account')
export type AccountDoc = PouchDB.Core.Document<Account>

export const accountDoc = (institution: InstitutionDoc, account: Account): AccountDoc => {
  const iroute = createInstitutionDocId(institution._id)
  if (!iroute) {
    throw new Error(`invalid institution id: ${institution._id}`)
  }
  const info = Object.assign({}, iroute, { account: account.number })
  const _id = createAccountDocId(info)
  return Object.assign({ _id }, account)
}

export const allAccountsForInstitution = (db: PouchDB.Database<{}>, institution: string): Promise<AccountDoc[]> => {
  const iroute = createInstitutionDocId(institution)
  if (!iroute) {
    throw new Error(`invalid institution id: ${institution}`)
  }
  const startkey = createAccountDocId({institution: iroute.institution, account: ''})
  const endkey = createAccountDocId({institution: iroute.institution, account: '\uffff'})
  return db.allDocs({startkey, endkey})
}
