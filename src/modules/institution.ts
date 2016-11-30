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
  export type Doc = PouchDB.Core.Document<Institution>
  export type Id = '<institution>' | makeid | '' | '\uffff'
}

export class Institution {
  static readonly docId = docURI.route<{institution: Institution.Id}, Institution.Id>('institution/:institution')
  static readonly startkey = Institution.docId({institution: ''})
  static readonly endkey = Institution.docId({institution: ''}) + '\uffff'
  static readonly all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: Institution.startkey } },
      { _id: { $lt: Institution.endkey } }
    ]
  }

  static readonly idFromDoc = (institution: Institution.Doc): Institution.Id => {
    const iparts = Institution.docId(institution._id)
    if (!iparts) {
      throw new Error('not an institution id: ' + institution._id)
    }
    return iparts.institution
  }

  static readonly doc = (institution: Institution): Institution.Doc => {
    const _id = Institution.docId({ institution: makeid() })
    return { _id, ...institution }
  }
}
