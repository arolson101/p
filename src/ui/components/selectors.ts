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

export const selectBank = createSelector(
  (state: AppState, props?: RouteProps<Bank.Params>) => state.db.current && state.db.current.view.banks,
  (state: AppState, props?: RouteProps<Bank.Params>) => props && Bank.docId(props.params),
  (banks, bankId) => {
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
)

export const selectAccount = createSelector(
  (state: AppState, props?: RouteProps<Account.Params>) => selectBank(state, props),
  (state: AppState, props?: RouteProps<Account.Params>) => props && Account.docId(props.params),
  (bank, accountId) => {
    if (!accountId) {
      throw new Error('no accountId!')
    }
    const account = bank.accounts.find(a => a.doc._id === accountId)
    if (!account) {
      throw new Error('account not found!')
    }
    return account
  }
)

export const selectTransaction = createSelector(
  (state: AppState, props?: RouteProps<Transaction.Params>) => selectAccount(state, props),
  (state: AppState, props?: RouteProps<Transaction.Params>) => props && props.params.txId,
  (account, txId) => {
    if (!txId) {
      throw new Error('no txId!')
    }
    const transaction = account.transactions.find(tx => tx.doc._id === txId)
    if (!transaction) {
      throw new Error('transaction not found!')
    }
    return transaction
  }
)

export const selectBills = (state: AppState) => {
  if (!state.db.current) {
    throw new Error('no open db!')
  }
  return state.db.current.view.bills
}

export const selectBill = createSelector(
  (state: AppState, props?: RouteProps<Bill.Params>) => state.db.current && state.db.current.view.bills,
  (state: AppState, props?: RouteProps<Bill.Params>) => props && Bill.docId(props.params),
  (bills, billId) => {
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
)
