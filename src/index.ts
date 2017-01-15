import { setObservableConfig } from 'recompose'
import rxjsconfig from 'recompose/rxjsObservableConfig'

require('bootstrap/dist/css/bootstrap.css')
require('font-awesome/css/font-awesome.css')
require('react-select/dist/react-select.css')

setObservableConfig(rxjsconfig)

import { main } from './main'

const root = document.getElementById('root')
if (!root) {
  throw new Error('root node not found')
}

if (!global.mainWasRun) {
  global.mainWasRun = true
  new Promise((resolve) => resolve(main(root)))
}

if (module.hot) {
  module.hot.accept()
}
