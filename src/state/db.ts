import * as CryptoPouch from 'crypto-pouch/forward'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { ThunkAction } from 'redux'
import { createIndices, DbInfo } from '../docs'

PouchDB.plugin(PouchFind)
PouchDB.plugin(CryptoPouch)

const METADB_NAME = 'meta' as DbInfo.Id

export interface OpenDb<T> {
  title: string
  _id: string
  handle: PouchDB.Database<T>
  changes: PouchDB.ChangeEmitter
  seq: number
}

export interface DbState {
  current: OpenDb<any> | undefined
  meta: OpenDb<any> | undefined
}

const initialState: DbState = {
  current: undefined,
  meta: undefined
}

type SET_DB = 'db/setDb'
const SET_DB = 'db/setDb'

interface SetDbAction {
  type: SET_DB
  db?: OpenDb<any>
}

const setDb = (db?: OpenDb<any>): SetDbAction => ({
  type: SET_DB,
  db
})

type State = DbSlice
type Thunk = ThunkAction<any, State, any>

type DB_CHANGE = 'db/changeEvent'
const DB_CHANGE = 'db/changeEvent'

interface ChangeEventAction {
  type: DB_CHANGE
  handle: PouchDB.Database<any>
  seq: number
}

const ChangeEvent = (handle: PouchDB.Database<any>, seq: number): ChangeEventAction => ({
  type: DB_CHANGE,
  handle,
  seq
})

export const CreateDb = (title: string, password?: string): Thunk =>
  async (dispatch, getState) => {
    const info = DbInfo.doc({ title })
    dispatch(LoadDb(DbInfo.idFromDocId(info._id), title, password))

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

export const LoadDb = (_id: DbInfo.Id, title?: string, password?: string): Thunk =>
  async (dispatch) => {
    title = title || _id
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
    .on('change', (change) => {
      dispatch(ChangeEvent(handle, change.seq))
    })

    dispatch(setDb({title, _id, handle, changes, seq: 0}))
  }

export const UnloadDb = (): SetDbAction => setDb(undefined)

type Actions
  = SetDbAction
  | ChangeEventAction
  | { type: '' }

const reducer = (state: DbState = initialState, action: Actions): DbState => {
  switch (action.type) {
    case SET_DB:
      if (action.db && action.db.title === METADB_NAME) {
        if (state.meta) {
          throw new Error('meta db is already loaded')
        }
        return { ...state, meta: action.db }
      } else {
        if (state.current) {
          state.current.changes.cancel()
        }
        return { ...state, current: action.db }
      }

    case DB_CHANGE:
      if (state.meta && state.meta.handle === action.handle) {
        return { ...state, meta: { ...state.meta, seq: action.seq } }
      } else if (state.current && state.current.handle === action.handle) {
        return { ...state, current: { ...state.current, seq: action.seq } }
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

export const DbInit = [
  () => LoadDb(METADB_NAME)
]
