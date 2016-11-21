import { main } from './main'

if (!(global as any).tapEventInstalled) {
  // Needed for onTouchTap
  // http://stackoverflow.com/a/34015469/988941
  require('react-tap-event-plugin')();
  (global as any).tapEventInstalled = true
}

const root = document.getElementById('root')
if (!root) {
  throw new Error('root node not found')
}

main(root)

if ((module as any).hot) {
  (module as any).hot.accept()
}
