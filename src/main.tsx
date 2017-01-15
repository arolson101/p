import * as React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createAppStore, AppInit } from './state'
import { App } from './ui'

export const main = async (element: Element) => {
  const history = hashHistory
  const store = createAppStore(history)
  const syncedHistory = syncHistoryWithStore(history, store)

  if (module.hot) {
    module.hot.accept('./state', () => {
      console.log('---- redux change')
      store.replaceReducer(require<any>('./state/index').AppState)
    })
  }

  await store.dispatch(AppInit())

  render(
    (
      <AppContainer>
        <App store={store} history={syncedHistory} />
      </AppContainer>
    ),
    element
  )
}
