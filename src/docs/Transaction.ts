import { randomBytes } from 'crypto'
import * as docURI from 'docuri'
import { Lookup } from '../util'
import { Bank, Account, Statement } from './'

export interface Split {
  [categoryId: string]: number
}

export interface Transaction {
  serverid?: string
  time: number
  type: string
  name: string
  memo: string
  amount: number
  statement?: Statement.DocId
  split: Split
}

export namespace Transaction {
  export type DocId = 'transaction/:bankId/:accountId/:txId'
  export type Doc = PouchDB.Core.Document<Transaction> & { _id: DocId; _rev?: string }
  export interface Params { bankId: Bank.Id, accountId: Account.Id, txId: string }
  export const docId = docURI.route<Params, DocId>('transaction/:bankId/:accountId/:txId')
  export const startkeyForAccount = (account: Account.Doc, time?: Date) =>
    docId({ ...accountParts(account), txId: time ? timeKey(time) : ''})
  export const endkeyForAccount = (account: Account.Doc, time?: Date) =>
    docId({ ...accountParts(account), txId: time ? timeKey(time) : ''}) + '\uffff'

  export type View = {
    doc: Doc
    time: Date
    balance: number
  }

  export const buildView = (doc: Doc, balance: number) => ({
    doc,
    time: new Date(doc.time),
    balance
  })

  export namespace routes {
    export const view = 'transaction/:bankId/:accountId/:txId'
    export const edit = 'transaction/:bankId/:accountId/:txId/edit'
  }

  export namespace to {
    export const view = (transaction: Doc): string => {
      return '/' + transaction._id
    }

    export const edit = (transaction: Doc): string => {
      return '/' + transaction._id + '/edit'
    }
  }

  const accountParts = (account: Account.Doc) => {
    const aparts = Account.docId(account._id)
    if (!aparts) {
      throw new Error('invalid accountId: ' + account._id)
    }
    return aparts
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  const timeKey = (time: Date): string => {
    return time.valueOf().toString()
  }

  export const doc = (account: Account.Doc, transaction: Transaction): Doc => {
    const txId = transaction.time.toString() + randomBytes(4).toString('hex')
    const _id = docId({ ...accountParts(account), txId })
    return { _id, ...transaction }
  }

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>
}
