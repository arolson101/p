import { createSelector } from 'reselect'
import { AppState } from '../../state'
import { Bank, Account } from '../../docs'
import { RouteProps } from './props'

export const selectCurrentDb = (state: AppState) => {
  return state.db.current!
}

export const selectDbInfo = (state: AppState) => {
  if (!state.db.current) {
    throw new Error('not logged in')
  }
  return state.db.current.info
}

export const selectBank = (state: AppState, props: RouteProps<Bank.Params>) => {
  const id = Bank.docId(props.params)
  return state.db.current && state.db.current.cache.banks.get(id)
}

const empty: any[] = []

export const selectBankAccounts = (state: AppState, props: RouteProps<Bank.Params>) => {
  const bank = selectBank(state, props)
  if (bank) {
    return bank.accounts.map(aid => state.db.current!.cache.accounts.get(aid)!).filter(acc => acc)
  } else {
    return empty as Account.Doc[]
  }
}

export const selectAccount = (state: AppState, props: RouteProps<Account.Params>) => {
  const id = Account.docId(props.params)
  return state.db.current && state.db.current.cache.accounts.get(id)
}

export const selectBills = createSelector(
  (state: AppState) => state.db.current!.cache.bills,
  (bills) => [...bills.values()]
)
