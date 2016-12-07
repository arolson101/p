require('font-awesome/css/font-awesome.css')
require('roboto-fontface/css/roboto/roboto-fontface.css')

import { main } from './main'

if (!(global as any).tapEventInstalled) {
  (global as any).tapEventInstalled = true
  // Needed for onTouchTap
  // http://stackoverflow.com/a/34015469/988941
  require('react-tap-event-plugin')();
}

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
