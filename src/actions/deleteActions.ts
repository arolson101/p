import { replace } from 'react-router-redux'
import { AppThunk, ThunkFcn, deleteDoc, deleteId, Deletion, pushChanges } from '../state/index'
import { Bank, Account, Budget, Transaction } from '../docs/index'
import { selectBankAccounts } from '../selectors'

type DeleteBankArgs = { bank: Bank.Doc }
export namespace deleteBank { export type Fcn = ThunkFcn<DeleteBankArgs, string> }
export const deleteBank: AppThunk<DeleteBankArgs, void> = ({bank}) =>
  async (dispatch, getState) => {
    const state = getState()
    const { db: { current } } = state
    if (!current) { throw new Error('no db') }
    let docs: Deletion[] = []
    const accounts = selectBankAccounts(state, bank._id)
    for (let account of accounts) {
      docs.push(deleteDoc(account))
      const transactions = await current.db.allDocs({
        include_docs: false,
        startkey: Transaction.startkeyForAccount(account),
        endkey: Transaction.endkeyForAccount(account)
      })
      for (let transaction of transactions.rows) {
        docs.push(deleteId(transaction.id, transaction.value.rev))
      }
    }
    docs.push(deleteDoc(bank))
    return dispatch(pushChanges({docs}))
  }

type DeleteAccountArgs = { bank: Bank.Doc, account: Account.Doc }
export namespace deleteAccount { export type Fcn = ThunkFcn<DeleteAccountArgs, string> }
export const deleteAccount: AppThunk<DeleteAccountArgs, void> = ({bank, account}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    const bankDoc = { ...bank, accounts: [...bank.accounts] }
    const idx = bankDoc.accounts.indexOf(account._id)
    if (idx !== -1) {
      bankDoc.accounts.splice(idx, 1)
    }

    let docs: (Deletion | AnyDocument)[] = [bankDoc]
    docs.push(deleteDoc(account))

    const transactions = await current.db.allDocs({
      include_docs: false,
      startkey: Transaction.startkeyForAccount(account),
      endkey: Transaction.endkeyForAccount(account)
    })
    for (let transaction of transactions.rows) {
      docs.push(deleteId(transaction.id, transaction.value.rev))
    }

    return dispatch(pushChanges({docs}))
  }

type DeleteAllTransactionsArgs = { account: Account.Doc }
export namespace deleteAllTransactions { export type Fcn = ThunkFcn<DeleteAllTransactionsArgs, void> }
export const deleteAllTransactions: AppThunk<DeleteAllTransactionsArgs, void> = ({account}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    let docs: Deletion[] = []
    const transactions = await current.db.allDocs({
      include_docs: false,
      startkey: Transaction.startkeyForAccount(account),
      endkey: Transaction.endkeyForAccount(account)
    })
    for (let transaction of transactions.rows) {
      docs.push(deleteId(transaction.id, transaction.value.rev))
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
