import * as docURI from 'docuri'
import { Dispatch, ThunkAction } from 'redux'
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

const SET_INSTITUTION = 'institution/set'
type SET_INSTITUTION = 'institution/set'

interface SetAction {
  type: SET_INSTITUTION
  current: InstitutionDoc
  accounts: AccountDoc[]
}

type State = InstitutionSlice & DbSlice
type Thunk = ThunkAction<any, State, any>

export const loadInstitution = (id: string): Thunk => {
  return async (dispatch: Dispatch<State>, getState: () => State) => {
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
}

export const reloadInstitution = (): Thunk => {
  return async (dispatch: Dispatch<State>, getState: () => State) => {
    const { institution } = getState()
    if (institution.current) {
      return loadInstitution(institution.current._id)(dispatch, getState, undefined)
    }
  }
}

type NullAction = { type: '' }
type Actions = SetAction | NullAction

const institution = (state: InstitutionState = initialState, action: Actions): InstitutionState => {
  switch (action.type) {
    case (SET_INSTITUTION as SET_INSTITUTION):
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
