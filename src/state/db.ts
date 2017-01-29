import * as electron from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import * as R from 'ramda'
import { ThunkAction, Dispatch } from 'redux'
import { DbInfo, docChangeActionTesters, Bank, Account, Category, Bill, Statement, Transaction, DocCache } from '../docs'
import { Lookup } from '../util'
import { AppThunk } from './'

const userData = electron.remote.app.getPath('userData')
const ext = '.db'

PouchDB.plugin(require<any>('pouchdb-adapter-node-websql'))
PouchDB.plugin(PouchFind)

const customOpenDatabase = require<any>('websql/custom')
const SQLiteDatabase = require<any>('websql/lib/sqlite/SQLiteDatabase')

const SQLiteDatabaseWithKey = (key?: string) =>
  class {
    _db: any
    constructor(name: string) {
      this._db = new SQLiteDatabase(name)
      if (key) {
        this._db.exec(
          [ { sql: `PRAGMA key=${key};` },
            { sql: `SELECT count(*) from sqlite_master;` }
          ],
          false,
          (err: any, ret: any[]) => {
            if (err || ret[1].error) {
              console.log(ret[1].error)
              throw ret[1].error
            }
          }
        )
      }
    }

    exec(queries: any, readOnly: any, callback: any) {
      return this._db.exec(queries, readOnly, callback)
    }
  }

const adapter = (key?: string) => ({ adapter: 'websql', websql: customOpenDatabase(SQLiteDatabaseWithKey(key)) })

export interface MetaDb {
  infos: DbInfo.Cache
}

export interface CurrentDb {
  info: DbInfo
  db: PouchDB.Database<any>
  changes: PouchDB.ChangeEmitter
  cache: {
    banks: Bank.Cache
    accounts: Account.Cache
    categories: Category.Cache
    bills: Bill.Cache
    statements: Statement.Cache
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
    const location = path.join(userData, encodeURIComponent(title.trim()) + '.db')
    const info = { title, location }
    await dispatch(loadDb(info, password))
    return info
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

const loadDb = (info: DbInfo, password?: string): Thunk =>
  async (dispatch) => {
    const db = new PouchDB<{}>(info.location, adapter(password))

    const changes = db.changes({
      since: 'now',
      live: true
    })
    .on('change', handleChange(db, dispatch))

    const allDocs = await db.allDocs({include_docs: true})
    const docs: AnyDocument[] = allDocs.rows.map(row => row.doc!)

    const cache: DocCache = {
      banks: Bank.createCache(),
      accounts: Account.createCache(),
      transactions: Transaction.createCache(),
      categories: Category.createCache(),
      bills: Bill.createCache(),
      statements: Statement.createCache(),
    }

    const mapper = R.cond([
      [Transaction.isDoc, (doc: Transaction.Doc) => cache.transactions.set(doc._id, doc)],
      [Bank.isDoc, (doc: Bank.Doc) => cache.banks.set(doc._id, doc)],
      [Account.isDoc, (doc: Account.Doc) => cache.accounts.set(doc._id, doc)],
      [Category.isDoc, (doc: Category.Doc) => cache.categories.set(doc._id, doc)],
      [Bill.isDoc, (doc: Bill.Doc) => cache.bills.set(doc._id, doc)],
      [Statement.isDoc, (doc: Statement.Doc) => cache.statements.set(doc._id, doc)],
    ]) as (doc: AnyDocument) => void

    R.forEach(mapper, docs)

    // const view = {
    //   banks: Lookup.map(cache.banks, bank => Bank.buildView(bank, cache))
    // }
    // console.log(view)
    dispatch(setDb({info, db, changes, cache: cache as any}))
  }

const deleteDb = (info: DbInfo): Thunk =>
  async (dispatch, getState) => {
    const { current } = getState().db

    // unload db if it's the current one
    if (current && current.info.title === info.title) {
      await dispatch(unloadDb())
    }

    // destroy db
    // const db = new PouchDB<any>(info.title, adapter())
    // await db.destroy()
    fs.unlinkSync(info.title)
  }

const unloadDb = (): SetDbAction => setDb(undefined)

type Actions =
  SetMetaDbAction |
  SetDbAction |
  DbInfo.CacheSetAction |
  Bank.CacheSetAction |
  Account.CacheSetAction |
  Category.CacheSetAction |
  Bill.CacheSetAction |
  Statement.CacheSetAction |
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

    case Bank.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, banks: action.cache } } }

    case Account.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, accounts: action.cache } } }

    case Category.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, categories: action.cache } } }

    case Bill.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, bills: action.cache } } }

    case Statement.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, statements: action.cache } } }

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

const isDbFilename = R.test(/\.db$/i)
const buildInfo = (filename: string) => ({
  title: decodeURIComponent(path.basename(filename, ext)),
  location: path.join(userData, filename)
})
const buildInfoCache = R.pipe(
  R.filter(isDbFilename),
  R.map(buildInfo),
  DbInfo.createCache
)

export const DbInit = (): AppThunk =>
  (dispatch) => {
    const files = fs.readdirSync(userData)
    const infos = buildInfoCache(files)
    dispatch(setMetaDb({infos}))
  }
