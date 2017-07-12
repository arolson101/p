import * as docURI from 'docuri'
import { makeid, Lookup } from '../util/index'
import { Account } from './Account'
import { DocCache } from './index'

export interface Bank {
  fi?: string

  name: string
  web?: string
  address?: string
  notes?: string
  favicon?: string

  online?: boolean

  fid?: string
  org?: string
  ofx?: string

  login?: {
    username: string
    password: string
  }

  accounts: Account.DocId[]
}

export namespace Bank {
  export type Id = ':bankId' | 'create' | makeid
  export type DocId = 'bank/:bankId'
  export type Doc = PouchDB.Core.Document<Bank> & { _id: DocId; _rev?: string }
  export interface Params { bankId: Id }
  export const docId = docURI.route<Params, DocId>('bank/:bankId')
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type View = {
    doc: Doc
    accounts: Account.Doc[]
  }

  export const buildView = (doc: Doc, cache: DocCache): View => {
    return ({
      doc,
      accounts: (doc.accounts || [])
        .map(accountId => cache.accounts.get(accountId)!)
        .filter((account?: Account.Doc) => account !== undefined)
        // .map((account: Account.Doc) => Account.buildView(account, cache))
    })
  }

  export const allDocs = {
    startkey: 'bank/',
    endkey: 'bank/\uffff',
  }

  export namespace routes {
    export const all = 'banks'
    export const view = 'bank/:bankId'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
    }

    export const view = (bank: Doc): string => {
      return '/' + bank._id
    }

    export const accountCreate = (bank: Doc): string => {
      const iparams = docId(bank._id)
      if (!iparams) {
        throw new Error('not a bank docid: ' + bank._id)
      }
      return '/' + Account.docId({bankId: iparams.bankId, accountId: 'create'})
    }
  }

  export const isDocId = (id: string): id is DocId => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const doc = (bank: Bank): Doc => {
    const _id = docId({ bankId: makeid() })
    return { _id, ...bank }
  }
}
