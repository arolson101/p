import { routerReducer, RouterState } from 'react-router-redux'

export interface RouterSlice {
  router: RouterState
}

export const RouterSlice = {
  router: routerReducer
}
