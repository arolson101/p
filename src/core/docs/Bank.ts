import * as docURI from 'docuri'
import { makeid } from 'util/index'
import { Account } from './Account'

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
  export type Doc = TDocument<Bank, DocId>
  export interface Params { bankId: Id }
  export const docId = docURI.route<Params, DocId>('bank/:bankId')

  export interface View {
    doc: Doc
  }

  export const buildView = (doc: Doc): View => ({
    doc
  })

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
      return '/' + Account.docId({ bankId: iparams.bankId, accountId: 'create' })
    }
  }

  export const isDocId = (id: string): id is DocId => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const doc = (bank: Bank | Doc): Doc => {
    const _id = docId({ bankId: makeid() })
    return { _id, ...bank }
  }
}
