import * as State_ from './state/index'
import * as Actions_ from './actions'
import * as Docs_ from './docs'

export namespace PStore {
  export const createAppStore = State_.createAppStore
  export const AppInit = State_.AppInit
  export const Actions = Actions_
  export const Docs = Docs_
}
