import * as electron from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as R from 'ramda'
import { ThunkAction, Dispatch } from 'redux'
import { docChangeActionTesters, Bank, Account, Category, Bill, Transaction, DocCache } from '../../docs'
import { Lookup } from '../../util'
import { AppThunk } from '../'
import { DbInfo } from './DbInfo'
import { PouchDB, adapter } from './pouch'

export { DbInfo }

const userData = electron.remote.app.getPath('userData')
const ext = '.db'

export interface CurrentDb {
  info: DbInfo
  db: PouchDB.Database<any>
  changes: PouchDB.ChangeEmitter
  cache: {
    banks: Bank.Cache
    accounts: Account.Cache
    categories: Category.Cache
    bills: Bill.Cache
  }
  view: {
    banks: Bank.View[]
    bills: Bill.View[]
  }
}

export interface DbState {
  files: DbInfo[]
  current?: CurrentDb
}

const initialState: DbState = {
  current: undefined,
  files: []
}

type State = DbSlice
type DbThunk<Args, Ret> = (args: Args) => ThunkAction<Promise<Ret>, State, any>
type DbFcn<Args, Ret> = (args: Args) => Promise<Ret>

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

type DB_SET_FILES = 'db/setFiles'
const DB_SET_FILES = 'db/setFiles'

interface DbSetFilesAction {
  type: DB_SET_FILES
  files: DbInfo[]
}

const dbSetFiles = (files: DbInfo[]): DbSetFilesAction => ({
  type: DB_SET_FILES,
  files
})

type CreateDbArgs = { name: string, password: string }
export namespace createDb { export type Fcn = DbFcn<CreateDbArgs, DbInfo> }
export const createDb: DbThunk<CreateDbArgs, DbInfo> = ({name, password}) =>
  async (dispatch, getState) => {
    const location = path.join(userData, encodeURIComponent(name.trim()) + '.db')
    const info: DbInfo = { name, location }
    await dispatch(loadDb({info, password}))
    dispatch(DbInit(undefined))
    return info
  }

import { wait } from '../../util'

type PushChangesArgs = { docs: AnyDocument[] }
export namespace pushChanges { export type Fcn = DbFcn<PushChangesArgs, void> }
export const pushChanges: DbThunk<PushChangesArgs, void> = ({docs}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) {
      throw new Error('no current db')
    }
    await current.db.bulkDocs(docs)
    await wait(5)
  }

export interface Deletion {
  _id: string
  _rev?: string
  _deleted: true
}

export const deleteDoc = (doc: AnyDocument): Deletion => ({
  _id: doc._id,
  _rev: doc._rev,
  _deleted: true
})

const handleChange = (handle: PouchDB.Database<any>, dispatch: Dispatch<DbSlice>) =>
  (change: PouchDB.ChangeInfo<{}>) => {
    console.log('change', change)
    // for (let [tester, action] of docChangeActionTesters) {
    //   if (tester(change.id)) {
    //     dispatch(action(handle))
    //     break
    //   }
    // }
  }

type LoadDbArgs = { info: DbInfo, password?: string }
export namespace loadDb { export type Fcn = DbFcn<LoadDbArgs, void> }
export const loadDb: DbThunk<LoadDbArgs, void> = ({info, password}) =>
  async (dispatch) => {
    const db = new PouchDB<{}>(info.location, adapter(password))

    const changes = db.changes({
      since: 'now',
      live: true
    })
    .on('change', handleChange(db, dispatch))

    console.time('load')

    const allDocs = await db.allDocs({include_docs: true})
    const docs: AnyDocument[] = allDocs.rows.map(row => row.doc!)

    const cache: DocCache = {
      banks: Bank.createCache(),
      accounts: Account.createCache(),
      transactions: Transaction.createCache(),
      categories: Category.createCache(),
      bills: Bill.createCache(),
    }

    const mapper = R.forEach(R.cond([
      [Transaction.isDoc, (doc: Transaction.Doc) => cache.transactions.set(doc._id, doc)],
      [Bank.isDoc, (doc: Bank.Doc) => cache.banks.set(doc._id, doc)],
      [Account.isDoc, (doc: Account.Doc) => cache.accounts.set(doc._id, doc)],
      [Category.isDoc, (doc: Category.Doc) => cache.categories.set(doc._id, doc)],
      [Bill.isDoc, (doc: Bill.Doc) => cache.bills.set(doc._id, doc)],
    ]) as (doc: AnyDocument) => void)

    mapper(docs)

    const view = {
      banks: Lookup.map(cache.banks, bank => Bank.buildView(bank, cache)),
      bills: Lookup.map(cache.bills, bill => Bill.buildView(bill))
    }

    console.timeEnd('load')
    console.log(`${cache.transactions.size} transactions`)

    dispatch(setDb({info, db, changes, cache, view}))
  }

type DeleteDbArgs = { info: DbInfo }
export namespace deleteDb { export type Fcn = DbFcn<DeleteDbArgs, void> }
export const deleteDb: DbThunk<DeleteDbArgs, void> = ({info}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()

    // unload db if it's the current one
    if (current && current.info.name === info.name) {
      await dispatch(unloadDb())
    }

    // delete file
    fs.unlinkSync(info.location)
    dispatch(DbInit(undefined))
  }

export namespace unloadDb { export type Fcn = () => void }
export const unloadDb = (): SetDbAction => setDb(undefined)

type Actions =
  DbSetFilesAction |
  SetDbAction |
  Bank.CacheSetAction |
  Account.CacheSetAction |
  Category.CacheSetAction |
  Bill.CacheSetAction |
  { type: '' }

const reducer = (state: DbState = initialState, action: Actions): DbState => {
  switch (action.type) {
    case DB_SET_FILES:
      return { ...state, files: action.files }

    case DB_SET_CURRENT:
      if (state.current) {
        state.current.changes.cancel()
      }
      return { ...state, current: action.current }

    case Bank.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, banks: action.cache } } }

    case Account.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, accounts: action.cache } } }

    case Category.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, categories: action.cache } } }

    case Bill.CACHE_SET:
      return { ...state, current: { ...state.current!, cache: { ...state.current!.cache, bills: action.cache } } }

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

const isDbFilename = R.test(/\.db$/i)
const buildInfo = (filename: string): DbInfo => ({
  name: decodeURIComponent(path.basename(filename, ext)),
  location: path.join(userData, filename)
})
const buildInfoCache = R.pipe(
  R.filter(isDbFilename),
  R.map(buildInfo),
  R.sortBy(doc => doc.title)
)

export const DbInit: AppThunk<void, void> = () =>
  async (dispatch) => {
    const files = fs.readdirSync(userData)
    const infos = buildInfoCache(files)
    dispatch(dbSetFiles(infos))
  }
