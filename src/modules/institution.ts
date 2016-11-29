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

export type InstitutionDoc = PouchDB.Core.Document<Institution>

export type InstitutionId = '<institution>' | makeid | '' | '\uffff'

export class Institution {
  static readonly docId = docURI.route<{institution: InstitutionId}, InstitutionId>('institution/:institution')
  static readonly startkey = Institution.docId({institution: ''})
  static readonly endkey = Institution.docId({institution: '\uffff'})
  static readonly all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: Institution.startkey } },
      { _id: { $lt: Institution.endkey } }
    ]
  }

  static doc = (institution: Institution): InstitutionDoc => {
    const _id = Institution.docId({ institution: makeid() })
    return { _id, ...institution }
  }
}
