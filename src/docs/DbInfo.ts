import * as R from 'ramda'
import { TCacheSetAction } from './index'

export interface DbInfo {
  title: string
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

  export type CACHE_SET = 'dbInfo/cacheSet'
  export const CACHE_SET = 'dbInfo/cacheSet'
  export type CacheSetAction = TCacheSetAction<CACHE_SET, Cache>
  export const cacheSetAction = (cache: Cache): CacheSetAction => ({
    type: CACHE_SET,
    cache
  })
}
