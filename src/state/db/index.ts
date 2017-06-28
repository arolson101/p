import * as crypto from 'crypto'
import * as electron from 'electron'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as R from 'ramda'
import { ThunkAction } from 'redux'
import * as Rx from 'rxjs/Rx'
import { DocCache, DbView, LocalDoc } from '../../docs/index'
import { AppThunk } from '../index'
import { DbInfo } from './DbInfo'
import { incomingDelta, resolveConflict } from './delta'
import { levelcrypt } from './levelcrypt'
import { PouchDB } from './pouch'

export { DbInfo }

const userData = electron.remote.app.getPath('userData')
const ext = '.db'
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
type DbChangeInfo = PouchDB.ChangeInfo<{}>

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
    const locals = docs.filter(doc => doc._id.startsWith('_local'))
    if (locals.length) {
      locals.push(
        LocalDoc.updateIds(current.cache.local, locals)
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

const safeGet = async <T> (db: PouchDB.Database<any>, id: string): Promise<T | undefined> => {
  try {
    return await db.get(id) as T
  } catch (err) {
    if (err.name !== 'not_found') {
      throw err
    }
  }
}

const genLocalId = (name: string): string => {
  const hostname = os.hostname()
  const userInfo = os.userInfo()
  const random = crypto.randomBytes(4).toString('hex')
  return `${hostname.substr(0, 18)}-${userInfo.username.substr(0, 18)}-${name.substr(0, 18)}-${random}`
}

type LoadDbArgs = { info: DbInfo, password: string }
export namespace loadDb { export type Fcn = DbFcn<LoadDbArgs, void> }
export const loadDb: DbThunk<LoadDbArgs, void> = ({info, password}) =>
  async (dispatch, getState) => {
    console.log('db: ', info.location)
    const db = new PouchDB(info.location, { password, adapter: 'leveldb', db: levelcrypt } as any)
    db.transform({incoming: incomingDelta})

    let localInfo: LocalDbInfo
    try {
      localInfo = await db.get(localInfoDocId) as LocalDbInfo
    } catch (ex) {
      localInfo = {
        _id: localInfoDocId,
        key: crypto.randomBytes(32).toString('base64'),
        localId: genLocalId(info.name),
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
      const { db: { current } } = getState()
      console.log(`processChanges: ${changeInfos.length}`, changeInfos)
      if (current) {
        const nextCache = DocCache.updateCache(current.cache, changeInfos)
        const nextView = DbView.buildView(nextCache)
        dispatch(dbChanges(nextView, nextCache))

        changeInfos.forEach(ci => changeProcessed$.next(ci.id))

        // dumpNextSequence(current)
      }
    })

    console.time('load')

    const local = await safeGet<LocalDoc.Doc>(db, LocalDoc.DocId) || LocalDoc.create()
    const localDocs: AnyDocument[] = []
    for (let id in local.ids) {
      const doc = await safeGet<AnyDocument | undefined>(db, id)
      if (doc) {
        localDocs.push(doc)
      }
    }
    // let docs: AnyDocument[] = []
    // for (let opts of DocCache.allDocs) {
    //   const allDocs = await db.allDocs({include_docs: true, conflicts: true, ...opts})
    //   docs.push(...allDocs.rows.map(row => row.doc!))
    // }
    // docs.push(local)
    // docs.push(...localDocs)
    const allDocs = await db.allDocs({include_docs: true, conflicts: true})
    const docs: AnyDocument[] = allDocs.rows.map(row => row.doc!).concat(localDocs).concat(local)
    resolveConflicts(db, ...docs)

    const cache = DocCache.addDocsToCache(docs)
    const view = DbView.buildView(cache)

    console.timeEnd('load')
    console.log(`${cache.transactions.size} transactions`)

    const current = { info, db, localInfo, change$, changeProcessed$, view, cache }
    dispatch(setDb(current))
    // dumpNextSequence(current)
  }

const resolveConflicts = (db: PouchDB.Database<any>, ...docs: (AnyDocument | undefined)[]): boolean => {
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
    const { db: { current } } = getState()

    // unload db if it's the current one
    if (current && current.info.name === info.name) {
      await dispatch(unloadDb())
    }

    // delete file
    rimraf(info.location)
    dispatch(DbInit(undefined))
  }

/**
 * Remove directory recursively
 * @param {string} dir_path
 * @see http://stackoverflow.com/a/42505874/3027390
 */
const rimraf = (dirPath: string) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(function (entry) {
      const entryPath = path.join(dirPath, entry)
      if (fs.lstatSync(entryPath).isDirectory()) {
        rimraf(entryPath)
      } else {
        fs.unlinkSync(entryPath)
      }
    })
    fs.rmdirSync(dirPath)
  }
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
        state.current.db.close()
      }
      return { ...state, current: action.current }

    case DB_CHANGES:
      return { ...state, current: { ...state.current!, view: action.view, cache: action.cache } }

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
