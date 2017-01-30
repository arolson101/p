import * as History from 'history'
import { routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware, combineReducers, bindActionCreators, Dispatch, ThunkAction } from 'redux'
import { responsiveStoreEnhancer } from 'redux-responsive'
import ReduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

export * from './browser'
export * from './db'
export * from './form'
export * from './fi'
export * from './i18n'
export * from './router'
export * from './ui'

import { BrowserSlice } from './browser'
import { DbSlice, DbInit } from './db'
import { FiSlice, FiInit } from './fi'
import { FormSlice } from './form'
import { I18nSlice } from './i18n'
import { RouterSlice } from './router'
import { UiSlice } from './ui'

export type AppState =
  BrowserSlice &
  DbSlice &
  FiSlice &
  FormSlice &
  I18nSlice &
  RouterSlice &
  UiSlice

export const AppState = combineReducers<AppState>({
  ...BrowserSlice,
  ...DbSlice,
  ...FiSlice,
  ...FormSlice,
  ...I18nSlice,
  ...RouterSlice,
  ...UiSlice
})

export type AppThunk<Args, Ret> = (args: Args) => ThunkAction<Promise<Ret>, AppState, any>
export type ThunkFcn<Args, Ret> = (args: Args) => Promise<Ret>

export const mapDispatchToProps = <T>(actions: { [key in keyof T]: Function }) =>
  (dispatch: Dispatch<AppState>) => bindActionCreators(actions as any, dispatch) as T

export const AppInit: AppThunk<void, void> = () => async (dispatch) => {
  type Initializer = AppThunk<void, void>
  const initializers: Initializer[] = [
    DbInit,
    FiInit
  ]
  await Promise.all(initializers.map(init => dispatch(init(undefined))))
}

export const createAppStore = (history: History.History) => {
  const routingMiddleware = routerMiddleware(history)
  const store = createStore<AppState>(
    AppState,
    composeWithDevTools(
      responsiveStoreEnhancer,
      applyMiddleware(ReduxThunk, routingMiddleware)
    )
  )
  return store
}
