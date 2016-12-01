export * from './db'
export * from './i18n'
export * from './router'
export * from './ui'

import { combineReducers, Dispatch, ThunkAction } from 'redux'
import { DbSlice, DbInit } from './db'
import { FormSlice } from './form'
import { I18nSlice } from './i18n'
import { RouterSlice } from './router'
import { UiSlice } from './ui'

export type AppState =
  DbSlice &
  FormSlice &
  I18nSlice &
  RouterSlice &
  UiSlice

export const AppState = combineReducers<AppState>({
  ...DbSlice,
  ...FormSlice,
  ...I18nSlice,
  ...RouterSlice,
  ...UiSlice
})

export type AppDispatch = Dispatch<AppState>
export type AppThunk = ThunkAction<any, AppState, any>

export const AppInit = (): AppThunk => async (dispatch) => {
  type Initializer = () => AppThunk
  const initializers: Initializer[] = [
    ...DbInit
  ]
  for (let init of initializers) {
    await dispatch(init())
  }
}
