import * as docURI from 'docuri'
import { createSelector } from 'reselect'
import { RouteComponentProps } from 'react-router'
import * as RRule from 'rrule-alt'
import { AppState } from './state/index'
import { Bank, Account, Transaction, Bill, Category, Budget, SyncConnection } from './docs/index'

const debugSelector = (name: string, id?: string) => {
  // console.log(`selector ${name} running for '${id}`)
}

export const selectBank = createSelector(
  (state: AppState, bankId: Bank.DocId | undefined) => state.docs.banks,
  (state: AppState, bankId: Bank.DocId | undefined) => bankId,
  (banks, bankId): Bank.Doc | undefined => {
    debugSelector('selectBank', bankId)
    const doc = bankId && banks[bankId]
    if (!doc) {
      console.error(`invalid bankId: `, bankId)
    }
    return doc
  }
)

export const selectBanks = createSelector(
  (state: AppState) => state.docs.banks,
  (state: AppState) => state,
  (banks, state): Bank.Doc[] => {
    debugSelector('selectBanks')
    return Object.keys(banks)
      .map((bankId: Bank.DocId) => selectBank(state, bankId)!)
      .filter(bank => !!bank)
  }
)

export const selectBankAccounts = createSelector(
  (state: AppState, bankId: Bank.DocId | undefined) => state.docs.banks,
  (state: AppState, bankId: Bank.DocId | undefined) => state.docs.accounts,
  (state: AppState, bankId: Bank.DocId | undefined) => bankId,
  (banks, accounts, bankId): Account.Doc[] => {
    debugSelector('selectBankAccounts', bankId)
    const doc = bankId && banks[bankId]
    if (!doc) {
      console.error(`invalid bankId: `, bankId)
    }
    return (doc ? doc.accounts : [])
      .map(accountId => accountId && accounts[accountId])
      .filter(account => !!account)
  }
)

export const selectAccount = createSelector(
  (state: AppState, accountId: Account.DocId | undefined) => state.docs.accounts,
  (state: AppState, accountId: Account.DocId | undefined) => accountId,
  (accounts, accountId): Account.Doc | undefined => {
    debugSelector('selectAccount', accountId)
    const doc = accountId && accounts[accountId]
    if (!doc) {
      console.error(`invalid accountId: `, accountId)
      return
    }
    return doc
  }
)

export const selectAccounts = createSelector(
  (state: AppState) => state.docs.accounts,
  (accounts): Account.Doc[] => {
    debugSelector('selectAccounts')
    return Object.values(accounts)
  }
)

export const selectBudget = createSelector(
  (state: AppState, budgetId: Budget.DocId | undefined) => state.docs.budgets,
  (state: AppState, budgetId: Budget.DocId | undefined) => budgetId,
  (budgets, budgetId): Budget.Doc | undefined => {
    debugSelector('selectBudget', budgetId)
    const doc = budgetId && budgets[budgetId]
    if (!doc) {
      console.error(`invalid budgetId: `, budgetId)
      return
    }
    return doc
  }
)

export const selectBudgets = createSelector(
  (state: AppState) => state.docs.budgets,
  (budgets): Budget.Doc[] => {
    debugSelector('selectBudgets')
    return Object.values(budgets)
      .sort(Budget.compareDoc)
  }
)

export const selectCategory = createSelector(
  (state: AppState, categoryId: Category.DocId | undefined) => state.docs.categories,
  (state: AppState, categoryId: Category.DocId | undefined) => categoryId,
  (categories, categoryId): Category.Doc | undefined => {
    debugSelector('selectCategory', categoryId)
    const doc = categoryId && categories[categoryId]
    if (!doc) {
      console.error(`invalid categoryId: `, categoryId)
      return
    }
    return doc
  }
)

export const selectCategories = createSelector(
  (state: AppState) => state.docs.categories,
  (categories): Category.Doc[] => {
    debugSelector('selectCategories')
    return Object.values(categories)
  }
)

export const selectCategoriesForBudget = createSelector(
  (state: AppState, budgetId: Budget.DocId | undefined) => state.docs.budgets,
  (state: AppState, budgetId: Budget.DocId | undefined) => state.docs.categories,
  (state: AppState, budgetId: Budget.DocId | undefined) => budgetId,
  (budgets, categories, budgetId): Category.Doc[] => {
    debugSelector('selectCategoriesForBudget', budgetId)
    const doc = budgetId && budgets[budgetId]
    if (!doc) {
      console.error('invalid budgetId: ', budgetId)
    }
    return (doc ? doc.categories : [])
      .map(categoryId => categories[categoryId])
      .filter(category => !!category)
  }
)

export const selectBillsForCategory = createSelector(
  (state: AppState, categoryId: Category.DocId | undefined) => state.docs.bills,
  (state: AppState, categoryId: Category.DocId | undefined) => categoryId,
  (bills, categoryId): Bill.Doc[] => {
    return Object.values(bills)
      .filter(bill => bill.category === categoryId)
  }
)

export const selectTransaction = createSelector(
  (state: AppState, transactionId: Transaction.DocId | undefined) => state.docs.transactions,
  (state: AppState, transactionId: Transaction.DocId | undefined) => transactionId,
  (transactions, transactionId): Transaction.Doc | undefined => {
    debugSelector('selectTransaction', transactionId)
    const doc = transactionId && transactions[transactionId]
    if (!doc) {
      console.error(`invalid transactionId: `, transactionId)
      return
    }
    return doc
  }
)

export const selectBills = createSelector(
  (state: AppState) => state.docs.bills,
  (bills): Bill.Doc[] => {
    debugSelector('selectBills')
    return Object.values(bills)
  }
)

export const selectSync = createSelector(
  (state: AppState, syncId: SyncConnection.DocId | undefined) => state.docs.syncConnections,
  (state: AppState, syncId: SyncConnection.DocId | undefined) => syncId,
  (syncConnections, syncId): SyncConnection.Doc | undefined => {
    debugSelector('selectSync', syncId)
    const doc = syncId && syncConnections[syncId]
    if (!doc) {
      console.error(`invalid syncId: `, syncId)
      return
    }
    return doc
  }
)

export const selectSyncs = createSelector(
  (state: AppState) => state.docs.syncConnections,
  (syncConnections): SyncConnection.Doc[] => {
    debugSelector('selectSyncs')
    return Object.values(syncConnections)
  }
)
