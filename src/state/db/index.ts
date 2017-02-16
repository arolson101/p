import * as electron from 'electron'
import * as fs from 'fs'
const debounce = require('lodash.debounce')
import * as path from 'path'
import * as R from 'ramda'
import { ThunkAction } from 'redux'
import { Bank, Account, Category, Bill, Budget, Transaction, DocCache, DbView } from '../../docs/index'
import { Lookup } from '../../util/index'
import { wait } from '../../util/index'
import { AppThunk } from '../index'
import { DbInfo } from './DbInfo'
import { incomingDelta, resolveConflict } from './delta'
import { PouchDB, adapter } from './pouch'

export { DbInfo }

const userData = electron.remote.app.getPath('userData')
const ext = '.db'

export interface CurrentDb {
  info: DbInfo
  db: PouchDB.Database<any>
  changes: PouchDB.ChangeEmitter
  processChanges: (() => void) & _.Cancelable
  view: DbView
  cache: DocCache
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

type DB_CHANGES = 'db/changes'
const DB_CHANGES = 'db/changes'
interface DbChangesAction {
  type: DB_CHANGES
  view: DbView
  cache: DocCache
}

const dbChanges = (view: DbView, cache: DocCache): DbChangesAction => ({
  type: DB_CHANGES,
  view,
  cache
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

type PushChangesArgs = { docs: AnyDocument[] }
export namespace pushChanges { export type Fcn = DbFcn<PushChangesArgs, void> }
export const pushChanges: DbThunk<PushChangesArgs, void> = ({docs}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) {
      throw new Error('no current db')
    }
    try {
      await current.db.bulkDocs(docs)
    } catch (err) {
      if (err.name === 'conflict') {
        // TODO: resolve conflict
        console.log('conflict!')
        throw err
      } else {
        throw err
      }
    }
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

const buildView = (cache: DocCache): DbView => {
  const views = {
    banks: Lookup.map(cache.banks, bank => Bank.buildView(bank, cache)),
    bills: Lookup.map(cache.bills, bill => Bill.buildView(bill, cache)),
    budgets: Lookup.map(cache.budgets, budget => Budget.buildView(budget, cache))
  }
  views.budgets.forEach(budget => Budget.linkView(budget, views))
  return views
}

const updateCache = (cache: DocCache, changes: PouchDB.ChangeInfo<AnyDocument>[]) => {
  const selectCache = R.cond([
    [Transaction.isDocId, R.always(cache.transactions)],
    [Bank.isDocId, R.always(cache.banks)],
    [Account.isDocId, R.always(cache.accounts)],
    [Category.isDocId, R.always(cache.categories)],
    [Bill.isDocId, R.always(cache.bills)],
    [Budget.isDocId, R.always(cache.budgets)],
  ]) as (docId: string) => Map<string, AnyDocument> | undefined

  const isDeletion = (change: PouchDB.ChangeInfo<AnyDocument>): boolean => !!change.deleted
  const deleteItem = (change: PouchDB.ChangeInfo<AnyDocument>): void => {
    const map = selectCache(change.id)
    if (map) {
      map.delete(change.id)
    }
  }

  const upsertItem = (change: PouchDB.ChangeInfo<AnyDocument>): void => {
    const map = selectCache(change.id)
    if (map) {
      console.assert(change.doc)
      map.set(change.id, change.doc!)
    }
  }

  R.forEach(
    R.cond([
      [isDeletion, deleteItem],
      [R.T, upsertItem]
    ]) as (change: PouchDB.ChangeInfo<AnyDocument>) => void,
    changes
  )
}

type LoadDbArgs = { info: DbInfo, password?: string }
export namespace loadDb { export type Fcn = DbFcn<LoadDbArgs, void> }
export const loadDb: DbThunk<LoadDbArgs, void> = ({info, password}) =>
  async (dispatch, getState) => {
    const db = new PouchDB<AnyDocument>(info.location, adapter(password))
    db.transform({incoming: incomingDelta})

    const changeQueue: PouchDB.ChangeInfo<AnyDocument>[] = []
    const processChanges = debounce(
      () => {
        const changes = changeQueue.splice(0)
        const { db: { current } } = getState()
        if (current) {
          let nextCache: DocCache = {
            banks: new Map(current.cache.banks),
            accounts: new Map(current.cache.accounts),
            transactions: new Map(current.cache.transactions),
            categories: new Map(current.cache.categories),
            bills: new Map(current.cache.bills),
            budgets: new Map(current.cache.budgets),
          }
          updateCache(nextCache, changes)
          const nextView = buildView(nextCache)
          dispatch(dbChanges(nextView, nextCache))
        }
      },
      1
    )

    const changes = db.changes({
      since: 'now',
      live: true,
      include_docs: true
    })
    .on(
      'change',
      (change: PouchDB.ChangeInfo<{}>) => {
        changeQueue.push(change)
        processChanges()
      }
    )

    console.time('load')

    const allDocs = await db.allDocs({include_docs: true, conflicts: true})
    const docs: AnyDocument[] = allDocs.rows.map(row => row.doc!)
    const conflicts = docs.filter((doc: AnyDocument) => doc._conflicts && doc._conflicts.length > 0)
    for (let conflict of conflicts) {
      db.resolveConflicts(conflict, resolveConflict)
    }

    const cache: DocCache = {
      banks: Bank.createCache(),
      accounts: Account.createCache(),
      transactions: Transaction.createCache(),
      categories: Category.createCache(),
      bills: Bill.createCache(),
      budgets: Budget.createCache()
    }

    docs.forEach(
      R.cond([
        [Transaction.isDoc, (doc: Transaction.Doc) => cache.transactions.set(doc._id, doc)],
        [Bank.isDoc, (doc: Bank.Doc) => cache.banks.set(doc._id, doc)],
        [Account.isDoc, (doc: Account.Doc) => cache.accounts.set(doc._id, doc)],
        [Category.isDoc, (doc: Category.Doc) => cache.categories.set(doc._id, doc)],
        [Bill.isDoc, (doc: Bill.Doc) => cache.bills.set(doc._id, doc)],
        [Budget.isDoc, (doc: Budget.Doc) => cache.budgets.set(doc._id, doc)],
      ]) as (doc: AnyDocument) => void
    )

    const view = buildView(cache)

    console.timeEnd('load')
    console.log(`${cache.transactions.size} transactions`)

    dispatch(setDb({info, db, changes, processChanges, view, cache}))
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
  DbChangesAction |
  { type: '' }

const reducer = (state: DbState = initialState, action: Actions): DbState => {
  switch (action.type) {
    case DB_SET_FILES:
      return { ...state, files: action.files }

    case DB_SET_CURRENT:
      if (state.current) {
        state.current.changes.cancel()
        state.current.processChanges.cancel()
      }
      return { ...state, current: action.current }

    case DB_CHANGES:
      return { ...state, current: { ...state.current, view: action.view, cache: action.cache } }

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
  R.sortBy((doc: DbInfo) => doc.name)
)

export const DbInit: AppThunk<void, void> = () =>
  async (dispatch) => {
    const files = fs.readdirSync(userData)
    const infos = buildInfoCache(files)
    dispatch(dbSetFiles(infos))
  }
