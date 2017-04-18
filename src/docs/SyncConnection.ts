import * as docURI from 'docuri'
import * as moment from 'moment'
import { makeid, Lookup, Token } from '../util/index'

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
  tokenTime: number
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
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

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

  export const doc = (sync: SyncConnection, lang: string): Doc => {
    const _id = docId({
      syncId: makeid(sync.provider, lang)
    })
    return { _id, ...sync }
  }

  export const inputPassword = (sync: SyncConnection.Doc, password: string): SyncConnection.Doc => {
    return { ...sync, password, state: 'INIT' }
  }

  export const expiration = (sync: SyncConnectionToken): Date => {
    const expires = moment(sync.tokenTime).add(sync.token.expires_in, 'seconds')
    return expires.toDate()
  }

  export const isExpired = (sync: SyncConnectionToken): boolean => {
    const expires = expiration(sync)
    return moment().isAfter(expires)
  }
}
