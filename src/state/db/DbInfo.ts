import * as R from 'ramda'
import { TCacheSetAction } from '../../docs'

export interface DbInfo {
  name: string
  location: string
}

export namespace DbInfo {

  export namespace routes {
    export const home = 'home'
  }

  export namespace to {
    export const home = () => {
      return '/' + routes.home
    }
  }

  export type Cache = DbInfo[]
  export const createCache = (docs: DbInfo[] = []): Cache => {
    return R.sortBy(doc => doc.title, docs)
  }
}
