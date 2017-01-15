import { setObservableConfig } from 'recompose'
import rxjsconfig from 'recompose/rxjsObservableConfig'

const __DEVELOPMENT__ = (process.env.NODE_ENV === 'development')
if (__DEVELOPMENT__) {
  global.Perf = require('react-addons-perf')
}

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
