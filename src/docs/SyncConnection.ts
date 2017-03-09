import * as moment from 'moment'
import { Token } from '../util/index'

export interface SyncConnection {
  provider: string
  token: Token
  tokenTime: number
}

export namespace SyncConnection {
  export interface Doc {
    _id: '_local/syncs'
    connections: SyncConnection[]
  }

  export const defaultDoc: Doc = {
    _id: '_local/syncs',
    connections: []
  }

  export const localId = '_local/syncs'
  export const icon = 'fa fa-server'

  export namespace routes {
    export const all = 'syncs'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
    }
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return (doc._id === localId)
  }

  export const expiration = (sync: SyncConnection): Date => {
    const expires = moment(sync.tokenTime).add(sync.token.expires_in, 'seconds')
    return expires.toDate()
  }

  export const isExpired = (sync: SyncConnection): boolean => {
    const expires = expiration(sync)
    return moment().isAfter(expires)
  }
}
