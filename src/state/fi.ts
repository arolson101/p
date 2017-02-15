import { FinancialInstitution, FinancialInstitutionProfile } from 'filist'
import { ThunkAction } from 'redux'
import { AppThunk } from './'

export interface FI extends FinancialInstitution {
  id: number // array index + 1
}

export type FiState = {
  list: FI[]
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
  fi: FI[]
}

export const setFi = (fi: FI[]): SetFiAction => ({
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

export const FiInit: AppThunk<void, void> = () =>
  async (dispatch) => {
    // TODO: don't webpack this
    const filist: FinancialInstitution[] = require<FinancialInstitution[]>('filist/filist.json')
    const fis = filist.map((fi, index) => ({...fi, id: index + 1}))
    dispatch(setFi(fis))
  }
