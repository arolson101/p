import * as docURI from 'docuri'
import { InstitutionId } from './institution'
import { makeid } from '../util'

// see ofx4js.domain.data.banking.AccountType
export enum AccountType {
  CHECKING,
  SAVINGS,
  MONEYMRKT,
  CREDITLINE,
  CREDITCARD,
}

export interface Account {
  institution: InstitutionId
  name: string
  type: AccountType
  number: string
  visible: boolean
  balance: number
}

export type AccountDoc = PouchDB.Core.Document<Account>

export type AccountId = '<account>' | makeid | '' | '\uffff'

export class Account {
  static readonly docId = docURI.route<{account: AccountId}, AccountId>('account/:account')
  static readonly startkey = Account.docId({account: ''})
  static readonly endkey = Account.docId({account: '\uffff'})
  static readonly all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: Account.startkey } },
      { _id: { $lt: Account.endkey } }
    ]
  }

  static readonly allForInstitution = (institutionId: InstitutionId): PouchDB.Selector => ({
    $and: [
      { _id: { $gt: Account.startkey } },
      { _id: { $lt: Account.endkey } },
      { institution: institutionId }
    ]
  })

  static readonly doc = (account: Account): AccountDoc => {
    const _id = Account.docId({ account: makeid() })
    return { _id, ...account }
  }

  static readonly createIndices = (db: PouchDB.Database<any>) => {
    return db.createIndex({
      index: {
        fields: ['institution']
      }
    })
  }
}
