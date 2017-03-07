export interface SyncConnection {
  provider: string
  accessToken: string
  refreshToken: string
  tokenType: string
  expires: number // new Date().valueOf()
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
}
