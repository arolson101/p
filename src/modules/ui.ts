import { reducer as uiReducer } from 'redux-ui'

export interface UiSlice {
  ui: any
}

export const UiSlice = {
  ui: uiReducer
}
