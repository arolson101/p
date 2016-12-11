import * as CryptoPouch from 'crypto-pouch'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { ThunkAction, Dispatch } from 'redux'
import { createIndices, DbInfo, docChangeActionTesters, Institution, Account } from '../docs'
import { AppThunk } from './'

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

type DB_SET_CURRENT = 'db/setCurrent'
const DB_SET_CURRENT = 'db/setCurrent'

interface SetDbAction {
  type: DB_SET_CURRENT
  current?: CurrentDb
}

const setDb = (current?: CurrentDb): SetDbAction => ({
  type: DB_SET_CURRENT,
  current
})

type DB_SET_META = 'db/setMeta'
const DB_SET_META = 'db/setMeta'

interface SetMetaDbAction {
  type: DB_SET_META
  meta: MetaDb
}

const setMetaDb = (meta: MetaDb): SetMetaDbAction => ({
  type: DB_SET_META,
  meta
})

const createDb = (title: string, password: string, lang: string): Thunk =>
  async (dispatch, getState) => {
    const info = DbInfo.doc({ title }, lang)
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

const loadDb = (info: DbInfo.Doc, password?: string): Thunk =>
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

const deleteDb = (info: DbInfo.Doc): Thunk =>
  async (dispatch, getState) => {
    const { current, meta } = getState().db

    // unload db if it's the current one
    if (current && current.info._id === info._id) {
      await dispatch(unloadDb())
    }

    // remove meta db info
    await meta.db.remove(info)

    // destroy db
    const db = new PouchDB<any>(info._id)
    await db.destroy()
  }

const unloadDb = (): SetDbAction => setDb(undefined)

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
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, institutions: action.cache } } }

    case Account.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, accounts: action.cache } } }

    default:
      return state
  }
}

export const dbActions = ({
  createDb,
  loadDb,
  unloadDb,
  deleteDb
})

export interface DbSlice {
  db: DbState
}

export const DbSlice = {
  db: reducer
}

export const DbInit = (): AppThunk =>
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
