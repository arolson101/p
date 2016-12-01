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
  export type DocId = '/institution/:institution'
  export type Doc = PouchDB.Core.Document<Institution> & { _id: DocId }
}

export class Institution {
  static readonly docId = docURI.route<{institution: Institution.Id}, Institution.DocId>('institution/:institution')
  static readonly startkey = Institution.docId({institution: ''})
  static readonly endkey = Institution.docId({institution: ''}) + '\uffff'
  static readonly all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: Institution.startkey } },
      { _id: { $lt: Institution.endkey } }
    ]
  }

  static readonly path = (db: string, institution: Institution.Doc, path: string = ''): string => {
    const institutionId = Institution.idFromDocId(institution._id)
    return `/${db}/${institutionId}/${path}`
  }

  static readonly isDocId = (id: string): boolean => {
    return !!Institution.docId(id as Institution.DocId)
  }

  static readonly idFromDocId = (institution: Institution.DocId): Institution.Id => {
    const iparts = Institution.docId(institution)
    if (!iparts) {
      throw new Error('not an institution id: ' + institution)
    }
    return iparts.institution
  }

  static readonly doc = (institution: Institution): Institution.Doc => {
    const _id = Institution.docId({ institution: makeid() })
    return { _id, ...institution }
  }
}
