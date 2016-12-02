import { routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware, combineReducers, Dispatch, ThunkAction } from 'redux'
import ReduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'remote-redux-devtools'
import { sagaMiddleware } from '../sagas'

export * from './db'
export * from './form'
export * from './i18n'
export * from './router'
export * from './ui'

import { DbSlice, DbInit } from './db'
import { CacheSlice } from './cache'
import { FormSlice } from './form'
import { I18nSlice } from './i18n'
import { RouterSlice, historyAPI } from './router'
import { UiSlice } from './ui'

export type AppState =
  DbSlice &
  CacheSlice &
  FormSlice &
  I18nSlice &
  RouterSlice &
  UiSlice

export const AppState = combineReducers<AppState>({
  ...DbSlice,
  ...CacheSlice,
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

const routingMiddleware = routerMiddleware(historyAPI)

export const createAppStore = () =>
  createStore<AppState>(
    AppState,
    composeWithDevTools(
      applyMiddleware(ReduxThunk, routingMiddleware, sagaMiddleware)
    )
  )
