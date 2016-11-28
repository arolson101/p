import * as CryptoPouch from 'crypto-pouch'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { ThunkAction } from 'redux'
import { spread, makeid } from '../util'

PouchDB.plugin(PouchFind)
PouchDB.plugin(CryptoPouch)

const METADB_NAME = 'meta'

export interface MetaDoc {
  _id: string
  name: string
}

export interface OpenDb {
  name: string
  handle: PouchDB.Database<any>
  changes: PouchDB.ChangeEmitter
  seq: number
}

export interface DbState {
  current: OpenDb | undefined
  meta: OpenDb | undefined
}

const initialState: DbState = {
  current: undefined,
  meta: undefined
}

type SET_DB = 'db/setDb'
const SET_DB = 'db/setDb' as SET_DB

interface SetDbAction {
  type: SET_DB
  db?: OpenDb
}

const setDb = (db?: OpenDb): SetDbAction => ({
  type: SET_DB,
  db
})

type State = DbSlice
type Thunk = ThunkAction<any, State, any>

type DB_CHANGE = 'db/changeEvent'
const DB_CHANGE = 'db/changeEvent' as DB_CHANGE

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

export const CreateDb = (name: string, password?: string): Thunk => async (dispatch, getState) => {
  const _id = makeid()

  const handle = new PouchDB(_id)
  if (password) {
    handle.crypto(password)
  }
  const changes = handle.changes({
    since: 'now',
    live: true
  })
  .on('change', (change) => {
    dispatch(ChangeEvent(handle, change.seq))
  })

  dispatch(setDb({name, handle, changes, seq: 0}))

  const meta = getState().db.meta!
  await meta.handle.put({
    _id,
    name
  })
}

export const LoadDb = (name: string, password?: string): Thunk => async (dispatch) => {
  const handle = new PouchDB(name)
  if (password) {
    handle.crypto(password)
  }
  const changes = handle.changes({
    since: 'now',
    live: true
  })
  .on('change', (change) => {
    dispatch(ChangeEvent(handle, change.seq))
  })

  dispatch(setDb({name, handle, changes, seq: 0}))
}

export const UnloadDb = (): SetDbAction => setDb(undefined)

type Actions
  = SetDbAction
  | ChangeEventAction
  | { type: '' }

const reducer = (state: DbState = initialState, action: Actions): DbState => {
  switch (action.type) {
    case SET_DB:
      if (action.db && action.db.name === METADB_NAME) {
        if (state.meta) {
          throw new Error('meta db is already loaded')
        }
        return spread(state, { meta: action.db } as DbState)
      } else {
        if (state.current) {
          state.current.changes.cancel()
        }
        return spread(state, { current: action.db } as DbState)
      }

    case DB_CHANGE:
      if (state.meta && state.meta.handle === action.handle) {
        return spread(state, { meta: spread(state.meta, { seq: action.seq } as OpenDb) } as DbState)
      } else if (state.current && state.current.handle === action.handle) {
        return spread(state, { current: spread(state.current, { seq: action.seq } as OpenDb) } as DbState)
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
  () => LoadDb(METADB_NAME, undefined)
]
