import * as docURI from 'docuri'
import * as moment from 'moment'
import { makeid, Token } from 'util/index'

interface SyncConnectionBase {
  provider: string
  password: string
  state: SyncConnection.State
  message: string
  lastAttempt: number
  lastSuccess: number
  otherSyncs: { [otherId: string]: number }
}

export interface SyncConnectionToken extends SyncConnectionBase {
  token: Token
}

export interface SyncConnectionFS extends SyncConnectionBase {
  root: string
}

export type SyncConnection = SyncConnectionToken | SyncConnectionFS

export namespace SyncConnection {
  export type State = 'ERR_PASSWORD' | 'ERROR' | 'INIT' | 'OK'

  export type Id = ':syncId' | 'create' | makeid
  export type DocId = '_local/sync/:syncId'
  export type Doc = TDocument<SyncConnection, DocId>
  export interface Params { syncId: Id }
  export const docId = docURI.route<Params, DocId>('_local/sync/:syncId')

  export const icon = 'fa fa-server'

  export namespace routes {
    export const all = 'syncs'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
    }
  }

  export const isDocId = (id: string): id is DocId => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const idFromDocId = (sync: DocId): Id => {
    const aparts = docId(sync)
    if (!aparts) {
      throw new Error('not a sync id: ' + sync)
    }
    return aparts.syncId
  }

  export const doc = (sync: SyncConnection): Doc => {
    const _id = docId({
      syncId: makeid()
    })
    return { _id, ...sync }
  }

  export const inputPassword = (sync: Doc, password: string): Doc => {
    return { ...sync, password, state: 'INIT' }
  }

  export const isExpired = (sync: SyncConnectionToken): boolean => {
    return moment().isAfter(sync.token.expiry_date)
  }
}
