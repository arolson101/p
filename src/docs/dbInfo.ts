import * as docURI from 'docuri'
import { makeid } from '../util'

export interface DbInfo {
  title: string
}

export namespace DbInfo {
  export type Id = ':dbInfo' | makeid | ''
  export type DocId = 'dbInfo/:info'
  export type Doc = PouchDB.Core.Document<DbInfo> & { _id: DocId }
}

export class DbInfo {
  static readonly docId = docURI.route<{dbInfo: DbInfo.Id}, DbInfo.DocId>('dbInfo/:dbInfo')
  static readonly startkey = DbInfo.docId({dbInfo: ''})
  static readonly endkey = DbInfo.docId({dbInfo: ''}) + '\uffff'
  static readonly all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: DbInfo.startkey } },
      { _id: { $lt: DbInfo.endkey } }
    ]
  }

  static readonly idFromDocId = (dbInfo: DbInfo.DocId): DbInfo.Id => {
    const parts = DbInfo.docId(dbInfo)
    if (!parts) {
      throw new Error('not an dbinfo id: ' + dbInfo)
    }
    return parts.dbInfo
  }

  static readonly doc = (dbInfo: DbInfo): DbInfo.Doc => {
    const _id = DbInfo.docId({ dbInfo: makeid() })
    return { _id, ...dbInfo }
  }

  static readonly path = (dbInfo: DbInfo.Doc) => {
    const db = DbInfo.idFromDocId(dbInfo._id)
    return `/${db}/`
  }
}
