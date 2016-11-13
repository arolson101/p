import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'remote-redux-devtools'
import ReduxThunk from 'redux-thunk'
import { AppState } from './modules'
import { App } from './ui/components/app'

export const main = (element: Element) => {
  const store = createStore(
    AppState,
    composeWithDevTools(
      applyMiddleware(ReduxThunk)
    )
  )

  if ((module as any).hot) {
    (module as any).hot.accept(
      './modules',
      () => store.replaceReducer(require('./modules').AppState)
    )
  }

  render(
    (
      <Provider store={store}>
        <App/>
      </Provider>
    ),
    element
  )
}
