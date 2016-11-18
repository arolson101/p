import * as CryptoPouch from 'crypto-pouch'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { Dispatch, ThunkAction } from 'redux'

require('pouchdb-all-dbs')(PouchDB)
PouchDB.plugin(PouchFind)
PouchDB.plugin(CryptoPouch)

export interface DbState {
  current: PouchDB.Database<any> | undefined
  changes: PouchDB.ChangeEmitter | undefined
  seq: number
  all: string[]
}

const initialState: DbState = {
  current: undefined,
  changes: undefined,
  seq: 0,
  all: []
}

type SET_ALL_DBS = 'db/setAll'
const SET_ALL_DBS = 'db/setAll' as SET_ALL_DBS

interface SetAllDbsAction {
  type: SET_ALL_DBS
  all: string[]
}

const setAllDbs = (all: string[]): SetAllDbsAction => ({
  type: SET_ALL_DBS,
  all
})

type State = DbSlice
type Thunk = ThunkAction<any, State, any>

export const LoadAllDbs = (): Thunk => {
  return async (dispatch: Dispatch<State>) => {
    const all = await PouchDB.allDbs()
    dispatch(setAllDbs(all))
  }
}

type SET_CURRENT_DB = 'db/setCurrent'
const SET_CURRENT_DB = 'db/setCurrent' as SET_CURRENT_DB

interface SetCurrentDbAction {
  type: SET_CURRENT_DB
  current: PouchDB.Database<any> | undefined
  changes: PouchDB.ChangeEmitter | undefined
}

const SetCurrentDb = (current?: PouchDB.Database<any>, changes?: PouchDB.ChangeEmitter): SetCurrentDbAction => ({
  type: SET_CURRENT_DB,
  current,
  changes
})

type DB_CHANGE = 'db/changeEvent'
const DB_CHANGE = 'db/changeEvent' as DB_CHANGE

interface ChangeEventAction {
  type: DB_CHANGE
  db: PouchDB.Database<any>
  seq: number
}

const ChangeEvent = (db: PouchDB.Database<any>, seq: number): ChangeEventAction => ({
  type: DB_CHANGE,
  db,
  seq
})

export const LoadDb = (name: string, password: string): Thunk => {
  return async (dispatch: Dispatch<State>) => {
    const db = new PouchDB(name)
    db.crypto(password)
    const changes = db.changes({
      since: 'now',
      live: true
    })
    .on('change', (change) => {
      dispatch(ChangeEvent(db, change.seq))
    })

    dispatch(SetCurrentDb(db, changes))
  }
}

export const UnloadDb = (): SetCurrentDbAction => SetCurrentDb(undefined, undefined)

type Actions
  = SetAllDbsAction
  | SetCurrentDbAction
  | ChangeEventAction
  | { type: '' }

const reducer = (state: DbState = initialState, action: Actions): DbState => {
  switch (action.type) {
    case SET_ALL_DBS:
      return Object.assign({}, state, { all: action.all } as DbState)

    case SET_CURRENT_DB:
      if (state.changes && state.changes !== action.changes) {
        state.changes.cancel()
      }
      return Object.assign({}, state, { current: action.current, changes: action.changes } as DbState)

    case DB_CHANGE:
      if (state.current !== action.db) {
        return state
      }
      return Object.assign({}, state, { seq: action.seq })

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
