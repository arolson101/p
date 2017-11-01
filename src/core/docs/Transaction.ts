import { randomBytes } from 'crypto'
import * as docURI from 'docuri'
import { Lookup } from 'util/index'
import { Bank, Account } from './'

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
  split: Split
}

export namespace Transaction {
  export type Id = ':txId' | ''
  export type DocId = 'transaction/:bankId/:accountId/:txId'
  export type Doc = PouchDB.Core.Document<Transaction> & { _id: DocId; _rev?: string }
  export interface Params { bankId: Bank.Id, accountId: Account.Id, txId: Id }
  export const docId = docURI.route<Params, DocId>('transaction/:bankId/:accountId/:txId')
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export const startkeyForAccountId = (accountId: Account.DocId, time?: Date) =>
    docId({ ...accountIdParts(accountId), txId: time ? timeKey(time) : '' })
  export const endkeyForAccountId = (accountId: Account.DocId, time?: Date) =>
    docId({ ...accountIdParts(accountId), txId: time ? timeKey(time) : '' }) + '\uffff'

  export const startkeyForAccount = (account: Account.View, time?: Date) => startkeyForAccountId(account.doc._id, time)
  export const endkeyForAccount = (account: Account.View, time?: Date) => endkeyForAccountId(account.doc._id, time)

  export type View = {
    doc: Doc
    time: Date
  }

  export const buildView = (doc: Doc) => ({
    doc,
    time: new Date(doc.time)
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

  const accountIdParts = (accountId: Account.DocId) => {
    const aparts = Account.docId(accountId)
    if (!aparts) {
      throw new Error('invalid accountId: ' + accountId)
    }
    return aparts
  }

  const accountParts = (account: Account.View) => {
    return accountIdParts(account.doc._id)
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  const timeKey = (time: Date): Id => {
    return time.valueOf().toString() as Id
  }

  export const doc = (account: Account.View, transaction: Transaction): Doc => {
    const txId = transaction.time.toString() + randomBytes(4).toString('hex') as Id
    const _id = docId({ ...accountParts(account), txId })
    return { _id, ...transaction }
  }
}
