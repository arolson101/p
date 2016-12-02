import * as docURI from 'docuri'
import { makeid } from '../util'

export interface Institution {
  name: string
  web?: string
  address?: string
  notes?: string

  online?: boolean

  fid?: string
  org?: string
  ofx?: string

  login?: {
    username: string
    password: string
  }
}

export namespace Institution {
  export type Id = ':institution' | makeid | ''
  export type DocId = 'institution/:institution'
  export type Doc = PouchDB.Core.Document<Institution> & { _id: DocId }

  export const docId = docURI.route<{institution: Id}, DocId>('institution/:institution')
  export const startkey = docId({institution: ''})
  export const endkey = docId({institution: ''}) + '\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export const path = (db: string, institution: Doc, path: string = ''): string => {
    const institutionId = idFromDocId(institution._id)
    return `/${db}/${institutionId}/${path}`
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: Doc): boolean => {
    return !!docId(doc._id)
  }

  export const idFromDocId = (institution: DocId): Id => {
    const iparts = docId(institution)
    if (!iparts) {
      throw new Error('not an institution id: ' + institution)
    }
    return iparts.institution
  }

  export const doc = (institution: Institution): Doc => {
    const _id = docId({ institution: makeid() })
    return { _id, ...institution }
  }
}
