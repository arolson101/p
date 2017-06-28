export type Theme = 'macOS' | 'windows'

export type SysState = {
  theme: Theme
}

const initialState: SysState = {
  theme: (process.platform === 'darwin' ? 'macOS' : 'windows')
}

export type SYS_SET_THEME = 'sys/setTheme'
export const SYS_SET_THEME = 'sys/setTheme'

export interface SetThemeAction {
  type: SYS_SET_THEME
  theme: Theme
}

export const setTheme = (theme: Theme): SetThemeAction => ({
  type: SYS_SET_THEME,
  theme
})

type Actions =
  SetThemeAction |
  { type: '' }

const reducer = (state: SysState = initialState, action: Actions): SysState => {
  switch (action.type) {
    case SYS_SET_THEME:
      return { ...state, theme: action.theme }

    default:
      return state
  }
}

export interface SysSlice {
  sys: SysState
}

export const SysSlice = {
  sys: reducer
}
