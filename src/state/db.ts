import * as crypto from 'crypto'
import * as PouchDB from 'pouchdb'
import { ThunkAction } from 'redux-thunk'
import * as Rx from 'rxjs/Rx'
import { DocCache, LocalDoc } from '../docs/index'
import { AppThunk } from './index'
import { DbInterface, defaultDbInterface } from '../imports'
import { incomingDelta, resolveConflict } from '../util/delta'
import { initDocs } from './views'

export interface DbInfo {
  name: string
  location: string
}

// const userData = electron.remote.app.getPath('userData')
const localInfoDocId = '_local/uid'

interface LocalDbInfo {
  _id: string
  localId: string
  last: number
  key: string
}

export interface CurrentDb {
  info: DbInfo
  localInfo: LocalDbInfo
  db: PouchDB.Database<any>
  change$: Rx.Subject<DbChangeInfo>
  changeProcessed$: Rx.Subject<string>
  local: LocalDoc.Doc
}

export interface DbState {
  dbi: DbInterface
  files: DbInfo[]
  current?: CurrentDb
}

const initialState: DbState = {
  dbi: defaultDbInterface,
  current: undefined,
  files: []
}

type State = DbSlice
type DbThunk<Args, Ret> = (args: Args) => ThunkAction<Promise<Ret>, State, any>
type DbFcn<Args, Ret> = (args: Args) => Promise<Ret>
type DbChangeInfo = PouchDB.ChangeInfo<{}>

export const DB_SET_INTERFACE = 'db/setInterface'

export interface DbSetInterfaceAction {
  type: typeof DB_SET_INTERFACE
  dbi: DbInterface
}

const dbSetInterface = (dbi: DbInterface): DbSetInterfaceAction => ({
  type: DB_SET_INTERFACE,
  dbi
})

export const DB_SET_CURRENT = 'db/setCurrent'

export interface SetDbAction {
  type: typeof DB_SET_CURRENT
  current?: CurrentDb
}

const setDb = (current?: CurrentDb): SetDbAction => ({
  type: DB_SET_CURRENT,
  current
})

const DB_SET_FILES = 'db/setFiles'

interface DbSetFilesAction {
  type: typeof DB_SET_FILES
  files: DbInfo[]
}

const dbSetFiles = (files: DbInfo[]): DbSetFilesAction => ({
  type: DB_SET_FILES,
  files
})

export const DB_CHANGES = 'db/changes'
export interface DbChangesAction<T> {
  type: typeof DB_CHANGES
  db: PouchDB.Database
  changes: PouchDB.ChangeInfo<T>[]
}

const dbChanges = (db: PouchDB.Database, changes: DbChangeInfo[]): DbChangesAction<any> => ({
  type: DB_CHANGES,
  db,
  changes,
})

type CreateDbArgs = { name: string, password: string }
export namespace createDb { export type Fcn = DbFcn<CreateDbArgs, DbInfo> }
export const createDb: DbThunk<CreateDbArgs, DbInfo> = ({name, password}) =>
  async (dispatch, getState) => {
    const { db: { dbi } } = getState()
    const info: DbInfo = dbi.createDb(name)
    await dispatch(loadDb({info, password}))
    dispatch(DbInit(dbi))
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
    const locals = docs.filter(doc => doc._id.startsWith('_local'))
    if (locals.length) {
      locals.push(
        LocalDoc.updateIds(current.local, locals)
      )
    }

    const docsToWrite = [
      ...docs,
      ...locals
    ]

    const docsProcessed$ = current.changeProcessed$
      .scan(
        (awaitingIds, id) => awaitingIds.filter(elt => elt !== id),
        docsToWrite.map(doc => doc._id)
      )
      .takeWhile(arr => arr.length > 0)

    try {
      await current.db.bulkDocs(docsToWrite)
    } catch (err) {
      if (err.name === 'conflict') {
        // TODO: resolve conflict
        console.log('conflict!')
        throw err
      } else {
        throw err
      }
    }

    for (let local of locals) {
      current.change$.next({
        id: local._id,
        changes: [local],
        doc: local,
        deleted: local._deleted,
        seq: 0
      } as DbChangeInfo)
    }

    await docsProcessed$.toPromise()
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

export const deleteId = (_id: string, _rev: string): Deletion => ({
  _id,
  _rev,
  _deleted: true
})

const safeGet = async <T> (db: PouchDB.Database<any>, id: string): Promise<T | undefined> => {
  try {
    return await db.get(id) as T
  } catch (err) {
    if (err.name !== 'not_found') {
      throw err
    }
  }
}

type LoadDbArgs = { info: DbInfo, password: string }
export namespace loadDb { export type Fcn = DbFcn<LoadDbArgs, void> }
export const loadDb: DbThunk<LoadDbArgs, void> = ({info, password}) =>
  async (dispatch, getState) => {
    const { db: { dbi } } = getState()
    console.log('db: ', info.location)
    const db = dbi.openDb(info, password)
    db.transform({incoming: incomingDelta})

    let localInfo: LocalDbInfo
    try {
      localInfo = await db.get(localInfoDocId) as LocalDbInfo
    } catch (ex) {
      localInfo = {
        _id: localInfoDocId,
        key: crypto.randomBytes(32).toString('base64'),
        localId: dbi.genLocalId(info.name),
        last: 0
      }
      await db.put(localInfo)
    }

    const observable: Rx.Observable<DbChangeInfo> = Rx.Observable.create((observer: Rx.Observer<DbChangeInfo>) => {
      const changes = db.changes({
        since: 'now',
        live: true,
        include_docs: true,
        conflicts: true
      })
      .on('change', (change) => {
        if (!resolveConflicts(db, change.doc)) {
          observer.next(change)
        }
      })
      .on('complete', () => {
        observer.complete()
      })
      return () => {
        changes.cancel()
      }
    })

    const change$ = new Rx.Subject<DbChangeInfo>()
    observable.subscribe(change$)
    const changeProcessed$ = new Rx.Subject<string>()

    change$
    .buffer(change$.debounceTime(10))
    .forEach((changeInfos) => {
      dispatch(dbChanges(db, changeInfos))
    })

    console.time('load')

    const local = await safeGet<LocalDoc.Doc>(db, LocalDoc.DocId) || LocalDoc.create()
    // const localDocs: AnyDocument[] = []
    // for (let id in local.ids) {
    //   const doc = await safeGet<AnyDocument | undefined>(db, id)
    //   if (doc) {
    //     localDocs.push(doc)
    //   }
    // }
    // // let docs: AnyDocument[] = []
    // // for (let opts of DocCache.allDocs) {
    // //   const allDocs = await db.allDocs({include_docs: true, conflicts: true, ...opts})
    // //   docs.push(...allDocs.rows.map(row => row.doc!))
    // // }
    // // docs.push(local)
    // // docs.push(...localDocs)
    // const allDocs = await db.allDocs({include_docs: true, conflicts: true})
    // const docs: AnyDocument[] = allDocs.rows.map(row => row.doc!).concat(localDocs).concat(local)
    // resolveConflicts(db, ...docs)

    // const cache = DocCache.addDocsToCache(docs)
    // const view = DbView.buildView(cache)

    const current = { info, db, localInfo, change$, changeProcessed$, local }
    await dispatch(setDb(current))

    await dispatch(initDocs({db}))
    console.timeEnd('load')
    // console.log(`${cache.transactions.size} transactions`)

    // dumpNextSequence(current)
  }

export const resolveConflicts = (db: PouchDB.Database<any>, ...docs: (AnyDocument | undefined)[]): boolean => {
  const conflicts = docs.filter((doc: AnyDocument | undefined) => doc && doc._conflicts && doc._conflicts.length > 0)
  for (let conflict of conflicts) {
    // console.log('conflict: ', conflict)
    db.resolveConflicts(conflict, resolveConflict)
  }
  return conflicts.length > 0
}

type DeleteDbArgs = { info: DbInfo }
export namespace deleteDb { export type Fcn = DbFcn<DeleteDbArgs, void> }
export const deleteDb: DbThunk<DeleteDbArgs, void> = ({info}) =>
  async (dispatch, getState) => {
    const { db: { dbi, current } } = getState()

    // unload db if it's the current one
    if (current && current.info.name === info.name) {
      await dispatch(unloadDb())
    }

    // delete file
    dbi.deleteDb(info)
    dispatch(DbInit(dbi))
  }

export namespace unloadDb { export type Fcn = () => void }
export const unloadDb = (): SetDbAction => setDb(undefined)

type Actions =
  DbSetInterfaceAction |
  DbSetFilesAction |
  SetDbAction |
  DbChangesAction<any> |
  EmptyAction

const reducer = (state: DbState = initialState, action: Actions): DbState => {
  switch (action.type) {
    case DB_SET_INTERFACE:
      return { ...state, dbi: action.dbi }

    case DB_SET_FILES:
      return { ...state, files: action.files }

    case DB_SET_CURRENT:
      if (state.current) {
        state.current.db.close()
      }
      return { ...state, current: action.current }

    case DB_CHANGES:
      if (state.current && state.current.db === action.db) {
        // const nextCache = DocCache.updateCache(state.current.cache, action.changes)
        // const nextView = DbView.buildView(nextCache)

        console.log(`${action.changes.length} changes`)
        for (let ci of action.changes) {
          state.current.changeProcessed$.next(ci.id)
        }

        return { ...state, current: { ...state.current! /*, view: nextView, cache: nextCache*/ } }
      } else {
        return state
      }

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

export const DbInit = (dbi: DbInterface) => (): ThunkAction<Promise<void>, DbSlice, any> =>
  async (dispatch, getState) => {
    dispatch(dbSetInterface(dbi))
    const infos = dbi.listDbs()
    dispatch(dbSetFiles(infos))
  }

PouchDB.plugin(require('transform-pouch'))
PouchDB.plugin(require('pouch-resolve-conflicts'))

const replicationStream = require<any>('pouchdb-replication-stream')
PouchDB.plugin(replicationStream.plugin)
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)
