import * as CryptoPouch from 'crypto-pouch'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { Dispatch, ThunkAction } from 'redux'

require('pouchdb-all-dbs')(PouchDB)
PouchDB.plugin(PouchFind)
PouchDB.plugin(CryptoPouch)

export interface DbState {
  current: PouchDB.Database<{}> | undefined
  all: string[]
}

const initialState: DbState = {
  current: undefined,
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
  current: PouchDB.Database<{}>
}

export const LoadDb = (name: string, password: string): SetCurrentDbAction => {
  const current = new PouchDB(name)
  current.crypto(password)
  return {
    type: SET_CURRENT_DB,
    current
  }
}

type Actions = SetAllDbsAction | SetCurrentDbAction | { type: '' }

const reducer = (state: DbState = initialState, action: Actions): DbState => {
  switch (action.type) {
    case SET_ALL_DBS:
      return Object.assign({}, state, { all: action.all } as DbState)

    case SET_CURRENT_DB:
      return Object.assign({}, state, { current: action.current } as DbState)

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
