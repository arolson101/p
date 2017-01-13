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

if (!(global as any).mainWasRun) {
  (global as any).mainWasRun = true
  new Promise((resolve) => resolve(main(root)))
}

if ((module as any).hot) {
  (module as any).hot.accept()
}
