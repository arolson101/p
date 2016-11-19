import { main } from './main'

const root = document.getElementById('root')
if (!root) {
  throw new Error('root node not found')
}

main(root)

if ((module as any).hot) {
  (module as any).hot.accept()
}
