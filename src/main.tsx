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

  if ((module as any).hot) {
    (module as any).hot.accept('./state', () => {
      console.log('---- redux change')
      store.replaceReducer(require('./state').AppState)
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
