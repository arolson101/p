import { replace } from 'react-router-redux'
import { AppThunk, ThunkFcn, deleteDoc, Deletion, pushChanges } from '../state/index'
import { Bank, Account, Budget } from '../docs/index'

type DeleteBankArgs = { bank: Bank.View }
export namespace deleteBank { export type Fcn = ThunkFcn<DeleteBankArgs, string> }
export const deleteBank: AppThunk<DeleteBankArgs, void> = ({bank}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }
    let docs: Deletion[] = []
    for (let account of bank.accounts) {
      docs.push(deleteDoc(account.doc))
      for (let transaction of account.transactions) {
        docs.push(deleteDoc(transaction.doc))
      }
    }
    docs.push(deleteDoc(bank.doc))
    return dispatch(pushChanges({docs}))
  }

type DeleteAccountArgs = { bank: Bank.View, account: Account.View }
export namespace deleteAccount { export type Fcn = ThunkFcn<DeleteAccountArgs, string> }
export const deleteAccount: AppThunk<DeleteAccountArgs, void> = ({bank, account}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    const idx = bank.accounts.indexOf(account)
    if (idx !== -1) {
      bank.accounts.splice(idx, 1)
    }

    let docs: (Deletion | AnyDocument)[] = [bank.doc]
    docs.push(deleteDoc(account.doc))

    for (let transaction of account.transactions) {
      docs.push(deleteDoc(transaction.doc))
    }

    return dispatch(pushChanges({docs}))
  }

type DeleteAllTransactionsArgs = { account: Account.View }
export namespace deleteAllTransactions { export type Fcn = ThunkFcn<DeleteAllTransactionsArgs, void> }
export const deleteAllTransactions: AppThunk<DeleteAllTransactionsArgs, void> = ({account}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    let docs: Deletion[] = []
    for (let transaction of account.transactions) {
      docs.push(deleteDoc(transaction.doc))
    }

    return dispatch(pushChanges({docs}))
  }

type DeleteBudgetArgs = { budget: Budget.View }
export namespace deleteBudget { export type Fcn = ThunkFcn<DeleteBudgetArgs, void> }
export const deleteBudget: AppThunk<DeleteBudgetArgs, void> = ({budget}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    let docs: Deletion[] = []
    for (let category of budget.categories) {
      docs.push(deleteDoc(category.doc))
    }
    docs.push(deleteDoc(budget.doc))

    return dispatch(pushChanges({docs}))
  }
