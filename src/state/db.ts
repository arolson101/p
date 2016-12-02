import * as CryptoPouch from 'crypto-pouch/forward'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { ThunkAction, Dispatch } from 'redux'
import { createIndices, DbInfo, docChangeActionTesters, docChangeAction } from '../docs'

PouchDB.plugin(PouchFind)
PouchDB.plugin(CryptoPouch)

const METADB_NAME = 'meta' as DbInfo.Id

export interface OpenDb<T extends PouchDB.Core.Document<any>> {
  _id: DbInfo.Id
  handle: PouchDB.Database<T>
  changes: PouchDB.ChangeEmitter
}

export interface DbState {
  current?: OpenDb<any>
  meta: OpenDb<DbInfo.Doc>
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
  current?: OpenDb<any>
}

const setDb = (current?: OpenDb<any>): SetDbAction => ({
  type: DB_SET_CURRENT,
  current
})

export type DB_SET_META = 'db/setMeta'
export const DB_SET_META = 'db/setMeta'

export interface SetMetaDbAction {
  type: DB_SET_META
  meta: OpenDb<DbInfo.Doc>
}

const setMetaDb = (meta: OpenDb<DbInfo.Doc>): SetMetaDbAction => ({
  type: DB_SET_META,
  meta
})

export const CreateDb = (title: string, password?: string): Thunk =>
  async (dispatch, getState) => {
    const info = DbInfo.doc({ title })
    dispatch(loadDb(DbInfo.idFromDocId(info._id), password))

    const meta = getState().db.meta!
    await meta.handle.put(info)

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
    for (let type in docChangeActionTesters) {
      const tester = docChangeActionTesters[type]
      if (tester(change.id)) {
        dispatch(docChangeAction(type, handle))
        break
      }
    }
  }

export const loadMetaDb = (): Thunk =>
  async (dispatch) => {
    const handle = new PouchDB(METADB_NAME)
    const changes = handle.changes({
      since: 'now',
      live: true
    })
    .on('change', handleChange(handle, dispatch))

    dispatch(setMetaDb({_id: METADB_NAME, handle, changes}))
  }

export const loadDb = (_id: DbInfo.Id, password?: string): Thunk =>
  async (dispatch) => {
    const handle = new PouchDB(_id)
    if (password) {
      handle.crypto(password)
      await checkPassword(handle)
    }
    await createIndices(handle)
    const changes = handle.changes({
      since: 'now',
      live: true
    })
    .on('change', handleChange(handle, dispatch))

    dispatch(setDb({_id, handle, changes}))
  }

export const unloadDb = (): SetDbAction => setDb(undefined)

type Actions =
  SetMetaDbAction |
  SetDbAction |
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
  () => loadMetaDb()
]
