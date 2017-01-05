import { responsiveStateReducer, ResponsiveState } from 'redux-responsive'

export { ResponsiveState }

export interface BrowserSlice {
  browser: ResponsiveState
}

export const BrowserSlice = {
  browser: responsiveStateReducer
}
