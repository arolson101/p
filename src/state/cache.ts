import { DbInfo, Institution, Account } from '../docs'

export interface CacheState {
  dbs: DbInfo.Cache
  institutions: Institution.Cache
  accounts: Account.Cache
}

const initialState: CacheState = {
  dbs: DbInfo.createCache([]),
  institutions: Institution.createCache([]),
  accounts: Account.createCache([])
}

type Actions =
  DbInfo.CacheSetAction |
  Institution.CacheSetAction |
  Account.CacheSetAction |
  { type: '' }

const reducer = (state: CacheState = initialState, action: Actions): CacheState => {
  switch (action.type) {
    case DbInfo.CACHE_SET_ACTION:
      return { ...state, dbs: action.cache }

    case Institution.CACHE_SET_ACTION:
      return { ...state, institutions: action.cache }

    case Account.CACHE_SET_ACTION:
      return { ...state, accounts: action.cache }

    default:
      return state
  }
}

export interface CacheSlice {
  cache: CacheState
}

export const CacheSlice = {
  cache: reducer
}
