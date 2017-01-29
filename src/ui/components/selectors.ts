import { createSelector } from 'reselect'
import { AppState } from '../../state'
import { Bank, Account } from '../../docs'
import { RouteProps } from './props'

export const selectCurrentDb = (state: AppState) => {
  return state.db.current!
}

export const selectBank = (state: AppState, props: RouteProps<Bank.Params>) => {
  const bankId = Bank.docId(props.params)
  const bank = state.db.current!.view.banks.find(b => b.doc._id === bankId)
  if (!bank) {
    throw new Error('bank not found!')
  }
  return bank
}

export const selectBankAccounts = (state: AppState, props: RouteProps<Bank.Params>) => {
  const bank = selectBank(state, props)
  return bank.accounts
}

export const selectAccount = (state: AppState, props: RouteProps<Account.Params>) => {
  const bank = selectBank(state, props)
  const accountId = Account.docId(props.params)
  const account = bank.accounts.find(a => a.doc._id === accountId)
  if (!account) {
    throw new Error('account not found!')
  }
  return account
}

export const selectTransactions = (state: AppState, props: RouteProps<Account.Params>) => {
  const account = selectAccount(state, props)
  return account.transactions
}

export const selectBills = createSelector(
  (state: AppState) => state.db.current!.cache.bills,
  (bills) => [...bills.values()]
)
