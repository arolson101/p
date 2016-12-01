import * as docURI from 'docuri'
import { makeid } from '../util'

export interface DbInfo {
  title: string
}

export namespace DbInfo {
  export type Id = ':dbInfo' | makeid | ''
  export type DocId = 'dbInfo/:info'
  export type Doc = PouchDB.Core.Document<DbInfo> & { _id: DocId }

  export const docId = docURI.route<{dbInfo: Id}, DocId>('dbInfo/:dbInfo')
  export const startkey = docId({dbInfo: ''})
  export const endkey = docId({dbInfo: ''}) + '\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export const idFromDocId = (dbInfo: DocId): Id => {
    const parts = docId(dbInfo)
    if (!parts) {
      throw new Error('not an dbinfo id: ' + dbInfo)
    }
    return parts.dbInfo
  }

  export const doc = (dbInfo: DbInfo): Doc => {
    const _id = docId({ dbInfo: makeid() })
    return { _id, ...dbInfo }
  }

  export const path = (dbInfo: Doc) => {
    const db = idFromDocId(dbInfo._id)
    return `/${db}/`
  }
}
