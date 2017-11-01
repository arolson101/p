
export interface AccountDeleteState {
  deleting?: boolean
  error?: Error
}

export type UiState = {
  accountDelete: AccountDeleteState
}

const initialState: UiState = {
  accountDelete: {}
}

export const UI_SET_ACCOUNTDELETE = 'ui/setAccountDelete'

export interface SetAccountDeleteAction {
  type: typeof UI_SET_ACCOUNTDELETE,
  accountDelete: AccountDeleteState
}

export const uiSetAccountDelete = (accountDelete: AccountDeleteState): SetAccountDeleteAction => ({
  type: UI_SET_ACCOUNTDELETE,
  accountDelete
})

type Actions =
  SetAccountDeleteAction |
  EmptyAction

const reducer = (state: UiState = initialState, action: Actions): UiState => {
  switch (action.type) {
    case UI_SET_ACCOUNTDELETE:
      return { ...state, accountDelete: { ...state.accountDelete, ...action.accountDelete } }

    default:
      return state
  }
}

export interface UiSlice {
  ui: UiState
}

export const UiSlice = {
  ui: reducer
}
