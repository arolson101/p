export * from './account'
export * from './db'
export * from './i18n'
export * from './institution'
export * from './router'
export * from './transaction'

import { combineReducers, Dispatch, ThunkAction } from 'redux'
import { DbSlice, DbInit } from './db'
import { FormSlice } from './form'
import { I18nSlice } from './i18n'
import { InstitutionSlice } from './institution'
import { RouterSlice } from './router'

export type AppState =
  DbSlice &
  FormSlice &
  I18nSlice &
  InstitutionSlice &
  RouterSlice;

export const AppState = combineReducers<AppState>(Object.assign(
  {},
  DbSlice,
  FormSlice,
  InstitutionSlice,
  I18nSlice,
  RouterSlice
))

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
