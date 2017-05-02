import { createSelector } from 'reselect'
import { AppState } from '../../state/index'
import { Bank, Account, Transaction, Bill } from '../../docs/index'
import { RouteProps } from './props'

export const selectBanks = (state: AppState) => {
  if (!state.db.current) {
    throw new Error('no open db!')
  }
  return state.db.current.view.banks
}

// TODO: figure out why createSelector isn't working on these anymore

export const selectBank = (state: AppState, props?: RouteProps<Bank.Params>) => {
  const banks = state.db.current && state.db.current.view.banks
  const bankId = props && Bank.docId(props.match.params)
  if (!banks) {
    throw new Error('no banks!')
  }
  if (!bankId) {
    throw new Error('no bankId!')
  }
  const bank = banks.find(b => b.doc._id === bankId)
  if (!bank) {
    throw new Error('bank not found!')
  }
  return bank
}

export const selectAccount = (state: AppState, props?: RouteProps<Account.Params>) => {
  const bank = selectBank(state, props)
  const accountId = props && Account.docId(props.match.params)
  if (!accountId) {
    throw new Error('no accountId!')
  }
  const account = bank.accounts.find(a => a.doc._id === accountId)
  if (!account) {
    throw new Error('account not found!')
  }
  return account
}

export const selectTransaction = (state: AppState, props?: RouteProps<Transaction.Params>) => {
  const account = selectAccount(state, props)
  const txId = props && props.match.params.txId
  if (!txId) {
    throw new Error('no txId!')
  }
  const transaction = account.transactions.find(tx => tx.doc._id === txId)
  if (!transaction) {
    throw new Error('transaction not found!')
  }
  return transaction
}

export const selectBills = (state: AppState) => {
  if (!state.db.current) {
    throw new Error('no open db!')
  }
  return state.db.current.view.bills
}

export const selectBill = (state: AppState, props?: RouteProps<Bill.Params>) => {
  const bills = state.db.current && state.db.current.view.bills
  const billId = props && Bill.docId(props.match.params)
  if (!bills) {
    throw new Error('no bills!')
  }
  if (!billId) {
    throw new Error('no billId!')
  }
  const bill = bills.find(b => b.doc._id === billId)
  if (!bill) {
    throw new Error('bill not found!')
  }
  return bill
}
