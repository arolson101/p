import { Dispatch, Action, ThunkAction } from 'redux';
import * as PouchDB from 'pouchdb-browser';

export interface DbState {
  current: PouchDB.Database<{}> | undefined;
  all: string[];
}

const initialState: DbState = {
  current: undefined,
  all: []
};


const SET_ALL_DBS = 'db/setAll';
const SET_CURRENT_DB = 'db/setCurrent';


interface SetAllDbsAction extends Action {
  all: string[];
}

const setAllDbs = (all: string[]): SetAllDbsAction => ({
  type: SET_ALL_DBS,
  all 
});

export function LoadAllDbs() {
  return async function (dispatch: Dispatch<Action>) {
    const all = ['a', 'b', 'c'];
    dispatch(setAllDbs(all));
  }
}


interface SetCurrentDbAction extends Action {
  current: PouchDB.Database<{}>;
}

export function LoadDb(name: string, password: string) {
  const current = new PouchDB(name);
  // set password
  return {
    type: SET_CURRENT_DB,
    current
  }
}


function reducer(state: DbState = initialState, action: Action) {
  switch (action.type) {
    case SET_ALL_DBS:
      return Object.assign({}, state, {all: (action as SetAllDbsAction).all});

    case SET_CURRENT_DB:
      return Object.assign({}, state, {current: (action as SetCurrentDbAction).current});

    default:
      return state;
  }
}


export interface DbSlice {
  db: DbState;
}

export const DbSlice = {
  db: reducer
}
