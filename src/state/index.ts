import * as History from 'history'
import { routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware, combineReducers, Dispatch, ThunkAction } from 'redux'
import ReduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

export * from './db'
export * from './form'
export * from './fi'
export * from './i18n'
export * from './router'
export * from './ui'

import { DbSlice, DbInit } from './db'
import { FiSlice, FiInit } from './fi'
import { FormSlice } from './form'
import { I18nSlice } from './i18n'
import { RouterSlice } from './router'
import { UiSlice } from './ui'

export type AppState =
  DbSlice &
  FiSlice &
  FormSlice &
  I18nSlice &
  RouterSlice &
  UiSlice

export const AppState = combineReducers<AppState>({
  ...DbSlice,
  ...FiSlice,
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
    DbInit,
    FiInit
  ]
  await Promise.all(initializers.map(init => dispatch(init())))
}

export const createAppStore = (history: History.History) => {
  const routingMiddleware = routerMiddleware(history)
  const store = createStore<AppState>(
    AppState,
    composeWithDevTools(
      applyMiddleware(ReduxThunk, routingMiddleware)
    )
  )
  return store
}
