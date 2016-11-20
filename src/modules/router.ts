import { routerReducer } from 'react-router-redux'
import { hashHistory } from 'react-router'

export const history = hashHistory

export interface RouterSlice {
  routing: any
}

export const RouterSlice = {
  routing: routerReducer
}
