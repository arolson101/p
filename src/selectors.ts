// import { createSelector } from 'reselect'
import { RouteComponentProps } from 'react-router'
import { AppState } from './state/index'
import { Bank, Account, Transaction, Bill } from './docs/index'

export const selectBanks = (state: AppState) => {
  if (!state.db.current) {
    throw new Error('no open db!')
  }
  return state.db.current.view.banks
}

// TODO: figure out why createSelector isn't working on these anymore

export const selectBank = (state: AppState, props?: RouteComponentProps<Bank.Params>) => {
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

export const selectAccount = (state: AppState, props?: RouteComponentProps<Account.Params>) => {
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

export const selectTransaction = (state: AppState, props?: RouteComponentProps<Transaction.Params>) => {
  const account = selectAccount(state, props)
  const txDocId = props && Transaction.docId(props.match.params)
  if (!txDocId) {
    throw new Error('no txDocId')
  }
  const transaction = account.transactions.find(tx => tx.doc._id === txDocId)
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

export const selectBill = (state: AppState, props?: RouteComponentProps<Bill.Params>) => {
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
