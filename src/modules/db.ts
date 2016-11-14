import * as CryptoPouch from 'crypto-pouch'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { Dispatch, Action, ThunkAction } from 'redux'

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

const SET_ALL_DBS = 'db/setAll'
const SET_CURRENT_DB = 'db/setCurrent'

interface SetAllDbsAction extends Action {
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

interface SetCurrentDbAction extends Action {
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

const reducer = (state: DbState = initialState, action: Action): DbState => {
  switch (action.type) {
    case SET_ALL_DBS:
      return Object.assign({}, state, {all: (action as SetAllDbsAction).all})

    case SET_CURRENT_DB:
      return Object.assign({}, state, {current: (action as SetCurrentDbAction).current})

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
