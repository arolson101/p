export * from './account'
export * from './db'
export * from './i18n'
export * from './institution'
export * from './transaction'

import { combineReducers, Dispatch } from 'redux'
import { I18nSlice } from './i18n'
import { DbSlice } from './db'
import { InstitutionSlice } from './institution'

export type AppState =
  I18nSlice &
  DbSlice &
  InstitutionSlice;

export const AppState = combineReducers<AppState>(Object.assign(
  {},
  DbSlice,
  InstitutionSlice,
  I18nSlice,
))

export type AppDispatch = Dispatch<AppState>
