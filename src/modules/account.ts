import * as docURI from 'docuri'
import { Institution } from './institution'
import { makeid } from '../util'

export interface Account {
  institution: string
  name: string
  type: Account.Type
  number: string
  visible: boolean
  balance: number
}

export class Account {
  static readonly docId = docURI.route<{account: Account.Id}, Account.Id>('account/:account')
  static readonly startkey = Account.docId({account: ''})
  static readonly endkey = Account.docId({account: ''}) + '\uffff'
  static readonly all: PouchDB.Selector = {
    _id: {
      $in: [ Account.startkey, Account.endkey ]
    }
  }

  static readonly allForInstitution = (institution: Institution.Doc): PouchDB.Selector => ({
    $and: [
      { _id: { $gt: Account.startkey } },
      { _id: { $lt: Account.endkey } },
      { institution: institution._id }
    ]
  })

  static readonly idFromDoc = (account: Account.Doc): Account.Id => {
    const aparts = Account.docId(account._id)
    if (!aparts) {
      throw new Error('not an account id: ' + account._id)
    }
    return aparts.account
  }

  static readonly doc = (account: Account): Account.Doc => {
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

export namespace Account {
  export type Doc = PouchDB.Core.Document<Account>
  export type Id = '<account>' | makeid | '' | '\uffff'
  // see ofx4js.domain.data.banking.AccountType
  export enum Type {
    CHECKING,
    SAVINGS,
    MONEYMRKT,
    CREDITLINE,
    CREDITCARD,
  }
}
