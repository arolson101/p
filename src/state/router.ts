import { routerReducer, RouterState } from 'react-router-redux'

export interface RouterSlice {
  routing: RouterState
}

export const RouterSlice = {
  routing: routerReducer
}
