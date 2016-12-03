import { ThunkAction, Dispatch } from 'redux'
import { DbInfo, Institution, Account } from '../docs'
import { observeStore } from '../util'
import { DbSlice } from './db'

type State = DbSlice & CacheSlice
type Store = Redux.Store<State>
type Thunk = ThunkAction<any, State, any>

export interface CacheState {
  dbs: DbInfo.Cache
  institutions: Institution.Cache
  accounts: Account.Cache
}

const initialState: CacheState = {
  dbs: DbInfo.createCache(),
  institutions: Institution.createCache(),
  accounts: Account.createCache()
}

type Actions =
  DbInfo.CacheSetAction |
  Institution.CacheSetAction |
  Account.CacheSetAction |
  { type: '' }

const reducer = (state: CacheState = initialState, action: Actions): CacheState => {
  switch (action.type) {
    case DbInfo.CACHE_SET:
      return { ...state, dbs: action.cache }

    case Institution.CACHE_SET:
      return { ...state, institutions: action.cache }

    case Account.CACHE_SET:
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

export const cacheInit = (): Thunk =>
  async (dispatch, getState) => {
    const { db } = getState()
    await dispatch(DbInfo.cacheUpdateAction(db.meta.handle))
  }

export const CacheInit = [
  cacheInit
]

export const CacheSubscribe = (store: Store) => {
  observeStore(
    store,
    state => state.db.current,
    (current) => {
      const dispatch = store.dispatch as Dispatch<State>
      dispatch(Institution.cacheUpdateAction(current && current.handle))
      dispatch(Account.cacheUpdateAction(current && current.handle))
    }
  )
}
