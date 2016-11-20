import * as React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'remote-redux-devtools'
import { AppState, history } from './modules'
import { App } from './ui'

const routingMiddleware = routerMiddleware(history)

export const main = (element: Element) => {
  const store = createStore(
    AppState,
    composeWithDevTools(
      applyMiddleware(ReduxThunk, routingMiddleware)
    )
  )

  const syncedHistory = syncHistoryWithStore(history, store)

  if ((module as any).hot) {
    (module as any).hot.accept('./modules', () => {
      console.log('---- modules change')
      store.replaceReducer(require('./modules').AppState)
    })
  }

  render(
    (
      <AppContainer>
        <App store={store} history={syncedHistory}/>
      </AppContainer>
    ),
    element
  )
}
