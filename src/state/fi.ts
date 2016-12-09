import { FinancialInstitution, FinancialInstitutionProfile } from 'filist'
import { ThunkAction } from 'redux'
import { AppThunk } from './'

export type FiState = {
  list: FinancialInstitution[]
}

const initialState: FiState = {
  list: []
}

type State = FiState
type Thunk = ThunkAction<any, State, any>

export const emptyprofile: FinancialInstitutionProfile = {
  address1: '',
  address2: '',
  address3: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  email: '',
  customerServicePhone: '',
  technicalSupportPhone: '',
  fax: '',
  financialInstitutionName: '',
  siteURL: ''
}

export const emptyfi: FinancialInstitution = {
  name: '',
  fid: '',
  org: '',
  ofx: '',
  profile: emptyprofile
}

export type FI_SET = 'fi/set'
export const FI_SET = 'fi/set'

export interface SetFiAction {
  type: FI_SET
  fi: FinancialInstitution[]
}

export const setFi = (fi: FinancialInstitution[]): SetFiAction => ({
  type: FI_SET,
  fi
})

type Actions =
  SetFiAction |
  { type: '' }

const reducer = (state: FiState = initialState, action: Actions): FiState => {
  switch (action.type) {
    case FI_SET:
      return { ...state, list: action.fi }

    default:
      return state
  }
}

export interface FiSlice {
  fi: FiState
}

export const FiSlice = {
  fi: reducer
}

export const FiInit = (): AppThunk =>
  async (dispatch) => {
    const filist: FinancialInstitution[] = require('json-loader!filist/filist.json')
    dispatch(setFi(filist))
  }