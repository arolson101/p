export * from './account';
export * from './db';
export * from './institution';
export * from './transaction';

import { combineReducers } from 'redux'
import { DbSlice } from './db'
import { InstitutionSlice } from './institution'

export type AppState =
  DbSlice &
  InstitutionSlice;

export const AppState = combineReducers<AppState>(Object.assign(
  {},
  DbSlice,
  InstitutionSlice,
))
