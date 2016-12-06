import * as CryptoPouch from 'crypto-pouch'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { ThunkAction, Dispatch } from 'redux'
import { createIndices, DbInfo, docChangeActionTesters, Institution, Account } from '../docs'

PouchDB.plugin(PouchFind)
PouchDB.plugin(CryptoPouch)

const METADB_NAME = 'meta' as DbInfo.Id

export interface MetaDb {
  db: PouchDB.Database<DbInfo.Doc>
  infos: DbInfo.Cache
}

export interface CurrentDb {
  info: DbInfo.Doc
  db: PouchDB.Database<any>
  changes: PouchDB.ChangeEmitter
  cache: {
    institutions: Institution.Cache
    accounts: Account.Cache
  }
}

export interface DbState {
  meta: MetaDb
  current?: CurrentDb
}

const initialState: DbState = {
  current: undefined,
  meta: undefined as any
}

type State = DbSlice
type Thunk = ThunkAction<any, State, any>

export type DB_SET_CURRENT = 'db/setCurrent'
export const DB_SET_CURRENT = 'db/setCurrent'

export interface SetDbAction {
  type: DB_SET_CURRENT
  current?: CurrentDb
}

const setDb = (current?: CurrentDb): SetDbAction => ({
  type: DB_SET_CURRENT,
  current
})

export type DB_SET_META = 'db/setMeta'
export const DB_SET_META = 'db/setMeta'

export interface SetMetaDbAction {
  type: DB_SET_META
  meta: MetaDb
}

const setMetaDb = (meta: MetaDb): SetMetaDbAction => ({
  type: DB_SET_META,
  meta
})

export const CreateDb = (title: string, password?: string): Thunk =>
  async (dispatch, getState) => {
    const info = DbInfo.doc({ title })
    const meta = getState().db.meta!
    await meta.db.put(info)
    await dispatch(loadDb(info, password))
    return info
  }

const passwordCheckDoc = {
  _id: 'pwcheck',
  data: 'ok'
}

const checkPassword = async (handle: PouchDB.Database<any>) => {
  try {
    await handle.get(passwordCheckDoc._id)
  } catch (err) {
    if (err.status === 404) {
      await handle.put(passwordCheckDoc)
    } else {
      throw err
    }
  }
}

const handleChange = (handle: PouchDB.Database<any>, dispatch: Dispatch<DbSlice>) =>
  (change: PouchDB.ChangeInfo<{}>) => {
    for (let [tester, action] of docChangeActionTesters) {
      if (tester(change.id)) {
        dispatch(action(handle))
        break
      }
    }
  }

export const loadMetaDb = (): Thunk =>
  async (dispatch) => {
    const db = new PouchDB<DbInfo.Doc>(METADB_NAME)
    db.changes({
      since: 'now',
      live: true
    })
    .on('change', handleChange(db, dispatch))

    const results = await db.find({selector: DbInfo.all})
    const infos = await DbInfo.createCache(results.docs)

    dispatch(setMetaDb({db, infos}))
  }

export const loadDb = (info: DbInfo.Doc, password?: string): Thunk =>
  async (dispatch) => {
    const db = new PouchDB<any>(info._id)
    if (password) {
      db.crypto(password)
      await checkPassword(db)
    }
    await createIndices(db)
    const changes = db.changes({
      since: 'now',
      live: true
    })
    .on('change', handleChange(db, dispatch))

    let results = await db.find({selector: Institution.all})
    const institutions = Institution.createCache(results.docs)

    results = await db.find({selector: Account.all})
    const accounts = Account.createCache(results.docs)

    const cache = { institutions, accounts }

    dispatch(setDb({info, db, changes, cache}))
  }

export const unloadDb = (): SetDbAction => setDb(undefined)

type Actions =
  SetMetaDbAction |
  SetDbAction |
  DbInfo.CacheSetAction |
  Institution.CacheSetAction |
  Account.CacheSetAction |
  { type: '' }

const reducer = (state: DbState = initialState, action: Actions): DbState => {
  switch (action.type) {
    case DB_SET_META:
      if (state.meta) {
        throw new Error('meta db is already loaded')
      }
      return { ...state, meta: action.meta }

    case DB_SET_CURRENT:
      if (state.current) {
        state.current.changes.cancel()
      }
      return { ...state, current: action.current }

    case DbInfo.CACHE_SET:
      return { ...state, meta: { ...state.meta, infos: action.cache } }

    case Institution.CACHE_SET:
      return { ...state, current: { ...state.current!, institutions: action.cache } }

    case Account.CACHE_SET:
      return { ...state, current: { ...state.current!, accounts: action.cache } }

    default:
      return state
  }
}

export interface DbSlice {
  db: DbState
}

export const DbSlice = {
  db: reducer
}

export const DbInit = [
  loadMetaDb
]
