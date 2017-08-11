import createHistory from 'history/createHashHistory'
import * as React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { createAppStore, AppInit, ImportsState, syncProviders } from 'core'
import { App } from './ui'

import { setObservableConfig } from 'recompose'
import rxjsconfig from 'recompose/rxjsObservableConfig'

if (__DEVELOPMENT__) {
  global.Perf = require<PerfAPI>('react-addons-perf')
}

// require('bootstrap/dist/css/bootstrap.css')
// require('font-awesome/css/font-awesome.css')
require('react-select/dist/react-select.css')

setObservableConfig(rxjsconfig)

const main = (element: Element, imports: ImportsState) => {
  const history = createHistory()
  const store = createAppStore(history, imports)

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

    module.hot.accept('core/state', () => {
      console.log('---- redux change')
      store.replaceReducer(require<any>('core/state/index').AppState)
    })
  }

  store.dispatch(AppInit(undefined))
  .then(() => {
    render(
      (
        <AppContainer>
          <App store={store} history={history}/>
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

import * as electron from 'electron'
import { dbLevelcrypt } from 'db-levelcrypt'
import { googleDriveSyncProvider } from 'sync-gdrive'
import { fsSyncProvider } from 'sync-fs'
import { oauthElectron } from 'oauth-electron'

syncProviders.push(googleDriveSyncProvider(oauthElectron), fsSyncProvider)

const userData = electron.remote.app.getPath('userData')
const db = dbLevelcrypt(userData)
const online = {}

main(root, {online, db})
