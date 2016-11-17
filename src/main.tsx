import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'remote-redux-devtools'
import ReduxThunk from 'redux-thunk'
import { AppState } from './modules'
import { App } from './ui/components/app'

const routingMiddleware = routerMiddleware(browserHistory)

export const main = (element: Element) => {
  const store = createStore(
    AppState,
    composeWithDevTools(
      applyMiddleware(ReduxThunk, routingMiddleware)
    )
  )

  const history = syncHistoryWithStore(browserHistory, store)

  if ((module as any).hot) {
    (module as any).hot.accept(
      './modules',
      () => store.replaceReducer(require('./modules').AppState)
    )
  }

  render(
    (
      <Provider store={store}>
        <App history={history}/>
      </Provider>
    ),
    element
  )
}
