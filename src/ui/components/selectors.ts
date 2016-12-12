import { AppState } from '../../state'
import { Institution, Account } from '../../docs'
import { RouteProps } from './props'

export const selectDbInfo = (state: AppState) => {
  return state.db.current && state.db.current.info
}

export const selectInstitution = (state: AppState, props: RouteProps<Institution.Params>) => {
  const id = Institution.docId(props.params)
  return state.db.current && state.db.current.cache.institutions.get(id)
}

export const selectAccount = (state: AppState, props: RouteProps<Account.Params>) => {
  const id = Account.docId(props.params)
  return state.db.current && state.db.current.cache.accounts.get(id)
}
