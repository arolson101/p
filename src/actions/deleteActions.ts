import { AppThunk, ThunkFcn, deleteDoc, Deletion } from '../state'
import { Bank, Account, Budget } from '../docs'

type DeleteBankArgs = { bank: Bank.View }
export namespace deleteBank { export type Fcn = ThunkFcn<DeleteBankArgs, string> }
export const deleteBank: AppThunk<DeleteBankArgs, void> = ({bank}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }
    let deletions: Deletion[] = []
    for (let account of bank.accounts) {
      deletions.push(deleteDoc(account.doc))
      for (let transaction of account.transactions) {
        deletions.push(deleteDoc(transaction.doc))
      }
    }
    deletions.push(deleteDoc(bank.doc))
    await current.db.bulkDocs(deletions)
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

    let deletions: Deletion[] = []
    deletions.push(deleteDoc(account.doc))

    for (let transaction of account.transactions) {
      deletions.push(deleteDoc(transaction.doc))
    }

    await current.db.bulkDocs([bank, ...deletions])
  }

type DeleteAllTransactionsArgs = { account: Account.View }
export namespace deleteAllTransactions { export type Fcn = ThunkFcn<DeleteAllTransactionsArgs, void> }
export const deleteAllTransactions: AppThunk<DeleteAllTransactionsArgs, void> = ({account}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    let deletions: Deletion[] = []
    for (let transaction of account.transactions) {
      deletions.push(deleteDoc(transaction.doc))
    }

    await current.db.bulkDocs(deletions)
  }

type DeleteBudgetArgs = { budget: Budget.View }
export namespace deleteBudget { export type Fcn = ThunkFcn<DeleteBudgetArgs, void> }
export const deleteBudget: AppThunk<DeleteBudgetArgs, void> = ({budget}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    let deletions: Deletion[] = []
    for (let category of budget.categories) {
      deletions.push(deleteDoc(category.doc))
    }
    deletions.push(deleteDoc(budget.doc))

    await current.db.bulkDocs(deletions)
  }
