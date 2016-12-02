import * as docURI from 'docuri'
import { Institution } from './institution'
import { makeid } from '../util'

export interface Account {
  institution: Institution.DocId
  name: string
  type: Account.Type
  number: string
  visible: boolean
  balance: number
}

export namespace Account {
  // see ofx4js.domain.data.banking.AccountType
  export enum Type {
    CHECKING,
    SAVINGS,
    MONEYMRKT,
    CREDITLINE,
    CREDITCARD,
  }

  export type Id = ':account' | makeid | ''
  export type DocId = 'account/:account'
  export type Doc = PouchDB.Core.Document<Account> & { _id: DocId }

  export const docId = docURI.route<{account: Id}, DocId>('account/:account')
  export const startkey = docId({account: ''})
  export const endkey = docId({account: ''}) + '\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export const allForInstitution = (institution: Institution.Doc): PouchDB.Selector => ({
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } },
      { institution: institution._id }
    ]
  })

  export const path = (db: string, account: Doc, path: string = ''): string => {
    const institutionId = Institution.idFromDocId(account.institution)
    const accountId = idFromDocId(account._id)
    return `/${db}/${institutionId}/${accountId}/${path}`
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: Doc): boolean => {
    return !!docId(doc._id)
  }

  export const idFromDocId = (account: DocId): Id => {
    const aparts = docId(account)
    if (!aparts) {
      throw new Error('not an account id: ' + account)
    }
    return aparts.account
  }

  export const doc = (account: Account): Doc => {
    const _id = docId({ account: makeid() })
    return { _id, ...account }
  }

  export const createIndices = (db: PouchDB.Database<any>) => {
    return db.createIndex({
      index: {
        fields: ['institution']
      }
    })
  }
}
