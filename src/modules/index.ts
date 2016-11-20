export * from './account'
export * from './db'
export * from './i18n'
export * from './institution'
export * from './transaction'

import { combineReducers, Dispatch } from 'redux'
import { DbSlice } from './db'
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
