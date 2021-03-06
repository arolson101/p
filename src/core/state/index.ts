import { History } from 'history'
import { routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware, combineReducers, bindActionCreators, Store, Dispatch } from 'redux'
import ReduxThunk, { ThunkAction } from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

export * from './db'
export * from './dialog'
export * from './views'
export * from './fi'
export * from './i18n'
export * from './imports'
export * from './router'
export * from './sys'
export * from './ui'

import { DbSlice, DbInit } from './db'
import { DialogSlice } from './dialog'
import { ViewsSlice } from './views'
import { FiSlice, FiInit } from './fi'
import { I18nSlice } from './i18n'
import { RouterSlice } from './router'
import { SysSlice } from './sys'
import { UiSlice } from './ui'
import { ImportsSlice, ImportsState, importsInit } from './imports'

export interface AppState extends
  DbSlice,
  DialogSlice,
  FiSlice,
  I18nSlice,
  ImportsSlice,
  RouterSlice,
  SysSlice,
  UiSlice,
  ViewsSlice {}

export const AppState = combineReducers<AppState>({
  ...DbSlice,
  ...DialogSlice,
  ...FiSlice,
  ...I18nSlice,
  ...ImportsSlice,
  ...RouterSlice,
  ...SysSlice,
  ...UiSlice,
  ...ViewsSlice,
})

export type AppStore = Store<AppState>
export type AppThunk<Args, Ret> = (args: Args) => ThunkAction<Promise<Ret>, AppState, any>
export type ThunkFcn<Args, Ret> = (args: Args) => Promise<Ret>

export const mapDispatchToProps = <T>(actions: { [key in keyof T]: Function }) =>
  (dispatch: Dispatch<AppState>) => bindActionCreators(actions as any, dispatch) as T

export const AppInit: AppThunk<void, void> = () =>
  async (dispatch) => {
    type Initializer = AppThunk<void, void>
    const initializers: Initializer[] = [
      DbInit,
      FiInit
    ]
    await Promise.all(initializers.map(init => dispatch(init(undefined))))
  }

export const createAppStore = (history: History, imports: ImportsState) => {
  const store = createStore<AppState>(
    AppState,
    composeWithDevTools(
      applyMiddleware(ReduxThunk, routerMiddleware(history))
    )
  )

  store.dispatch(importsInit(imports))

  return store
}
