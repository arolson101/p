import * as React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { createAppStore, AppInit } from './state/index'
import { App } from './ui/index'

import { setObservableConfig } from 'recompose'
import rxjsconfig from 'recompose/rxjsObservableConfig'

if (__DEVELOPMENT__) {
  global.Perf = require<PerfAPI>('react-addons-perf')
}

// require('bootstrap/dist/css/bootstrap.css')
// require('font-awesome/css/font-awesome.css')
require('react-select/dist/react-select.css')

setObservableConfig(rxjsconfig)

const main = (element: Element) => {
  const store = createAppStore()

  if (module.hot) {
    module.hot.accept('./ui', () => {
      console.log('---- ui change')
      const NextApp = require<any>('./ui').App
      render(
        <AppContainer>
          <NextApp store={store} />
        </AppContainer>,
        element
      )
    })

    module.hot.accept('./state', () => {
      console.log('---- redux change')
      store.replaceReducer(require<any>('./state/index').AppState)
    })
  }

  store.dispatch(AppInit(undefined))
  .then(() => {
    render(
      (
        <AppContainer>
          <App store={store} />
        </AppContainer>
      ),
      element
    )
  })
}

const root = document.getElementById('root')
if (!root) {
  throw new Error('root node not found')
}

main(root)
