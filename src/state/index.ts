import { History } from 'history'
import { routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware, combineReducers, bindActionCreators, Dispatch } from 'redux'
import ReduxThunk, { ThunkAction } from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { PStoreImports } from '../imports'

export * from './db'
export * from './dialog'
export * from './views'
export * from './form'
export * from './fi'
export * from './i18n'
export * from './router'
export * from './sys'
export * from './ui'

import { DbSlice, DbInit } from './db'
import { DialogSlice, DialogState } from './dialog'
import { ViewsSlice } from './views'
import { FiSlice, FiInit } from './fi'
import { FormSlice } from './form'
import { I18nSlice } from './i18n'
import { RouterSlice } from './router'
import { SysSlice } from './sys'
import { UiSlice } from './ui'

export type AppState =
  DbSlice &
  DialogSlice &
  FiSlice &
  FormSlice &
  I18nSlice &
  RouterSlice &
  SysSlice &
  UiSlice &
  ViewsSlice

export const AppState = combineReducers<AppState>({
  ...DbSlice,
  ...DialogSlice,
  ...FiSlice,
  ...FormSlice,
  ...I18nSlice,
  ...RouterSlice,
  ...SysSlice,
  ...UiSlice,
  ...ViewsSlice,
})

export type AppThunk<Args, Ret> = (args: Args) => ThunkAction<Promise<Ret>, AppState, any>
export type ThunkFcn<Args, Ret> = (args: Args) => Promise<Ret>

export const mapDispatchToProps = <T>(actions: { [key in keyof T]: Function }) =>
  (dispatch: Dispatch<AppState>) => bindActionCreators(actions as any, dispatch) as T

export const AppInit: AppThunk<PStoreImports, void> = (imports) =>
  async (dispatch) => {
    type Initializer = AppThunk<void, void>
    const initializers: Initializer[] = [
      DbInit(imports.db),
      FiInit
    ]
    await Promise.all(initializers.map(init => dispatch(init(undefined))))
  }

export const createAppStore = (history: History) => {
  const store = createStore<AppState>(
    AppState,
    composeWithDevTools(
      applyMiddleware(ReduxThunk, routerMiddleware(history))
    )
  )
  return store
}
