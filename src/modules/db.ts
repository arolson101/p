import * as CryptoPouch from 'crypto-pouch'
import * as PouchDB from 'pouchdb-browser'
import * as PouchFind from 'pouchdb-find'
import { Dispatch, Action } from 'redux'

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

export function LoadAllDbs() {
  return async function (dispatch: Dispatch<Action>) {
    const all = await PouchDB.allDbs()
    dispatch(setAllDbs(all))
  }
}

interface SetCurrentDbAction extends Action {
  current: PouchDB.Database<{}>
}

export function LoadDb(name: string, password: string) {
  const current = new PouchDB(name)
  current.crypto(password)
  return {
    type: SET_CURRENT_DB,
    current
  }
}

function reducer(state: DbState = initialState, action: Action) {
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
