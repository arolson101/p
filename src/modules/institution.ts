import * as docURI from 'docuri'
import { Dispatch, ThunkAction } from 'redux'
import { createSelector } from 'reselect'
import { DbSlice } from './db'
import { AccountDoc, allAccountsForInstitution } from './account'

export interface Institution {
  name: string
  web?: string
  address?: string
  notes?: string

  online?: boolean

  fid?: string
  org?: string
  ofx?: string

  login?: {
    username: string
    password: string
  }
}

export const createInstitutionDocId = docURI.route<{institution: string}>('institution/:institution')
export type InstitutionDoc = PouchDB.Core.Document<Institution>
export const institutionDoc = (institution: Institution): InstitutionDoc => {
  const _id = createInstitutionDocId({ institution: institution.name })
  return Object.assign({ _id }, institution)
}

export interface InstitutionState {
  current: InstitutionDoc | undefined
  accounts: AccountDoc[]
}

const initialState: InstitutionState = {
  current: undefined,
  accounts: []
}

type SET_INSTITUTION = 'institution/set'
const SET_INSTITUTION = 'institution/set' as SET_INSTITUTION

interface SetAction {
  type: SET_INSTITUTION
  current: InstitutionDoc
  accounts: AccountDoc[]
}

type State = InstitutionSlice & DbSlice
type Thunk = ThunkAction<any, State, any>

export const loadInstitution = (id: string): Thunk => async (dispatch, getState) => {
  const { db } = getState()
  if (!db.current) {
    throw new Error('no current db')
  }
  const current = await db.current.get(id) as InstitutionDoc
  const accounts = await allAccountsForInstitution(db.current, id)
  dispatch({
    type: SET_INSTITUTION,
    current,
    accounts
  } as SetAction)
}


export const allInstitutions = async (db: PouchDB.Database<Institution>) => {
  const startkey = createInstitutionDocId({institution: ''})
  const endkey = createInstitutionDocId({institution: '\uffff'})
  const all = await db.allDocs({startkey, endkey})
  return all
}

export const allInstitutionsSelector = createSelector(
  (state: State) => state.db.current,
  (state: State) => state.db.seq,
  async (db: PouchDB.Database<Institution>, seq: number) => {
    return seq
  }
)

// allInstitutionsSelector()


export const reloadInstitution = (): Thunk => async (dispatch, getState) => {
  const { institution } = getState()
  if (institution.current) {
    return loadInstitution(institution.current._id)(dispatch, getState, undefined)
  }
}

type Actions = SetAction | { type: '' }

const institution = (state: InstitutionState = initialState, action: Actions): InstitutionState => {
  switch (action.type) {
    case SET_INSTITUTION:
      return Object.assign({}, state, { current: action.current, accounts: action.accounts } as InstitutionState)

    default:
      return state
  }
}

export interface InstitutionSlice {
  institution: InstitutionState
}

export const InstitutionSlice = {
  institution
}
