import { createSelector } from 'reselect'
import { RouteComponentProps } from 'react-router'
import * as RRule from 'rrule-alt'
import { AppState } from './state/index'
import { Bank, Account, Transaction, Bill, Category, Budget, SyncConnection } from './docs/index'

export const selectBank = (bankId: Bank.DocId) => createSelector(
  (state: AppState) => state.docs.banks,
  (state: AppState) => state.docs.accounts,
  (banks, accounts) => {
    const doc = banks[bankId]
    if (!doc) {
      console.error(`invalid bankId: `, bankId)
      return
    }
    return ({
      doc,
      accounts: (doc.accounts || [])
        .map(accountId => accounts[accountId])
        .filter((account?: Account.Doc) => account !== undefined)
    }) as Bank.View
  }
)

export const selectBanks = createSelector(
  (state: AppState) => state.docs.banks,
  (state: AppState) => state,
  (banks, state) => {
    return Object.keys(banks)
      .map((bankId: Bank.DocId) => selectBank(bankId)(state)!)
      .filter(bank => !!bank)
  }
)

export const selectAccount = (accountId: Account.DocId) => createSelector(
  (state: AppState) => state.docs.accounts,
  (accounts) => {
    const doc = accounts[accountId]
    if (!doc) {
      console.error(`invalid accountId: `, accountId)
      return
    }
    return doc
  }
)

export const selectBudget = (budgetId: Budget.DocId) => createSelector(
  (state: AppState) => state.docs.budgets,
  (budgets) => {
    const doc = budgets[budgetId]
    if (!doc) {
      console.error(`invalid budgetId: `, budgetId)
      return
    }
    return doc
  }
)

export const selectBudgetView = (budgetId: Budget.DocId) => createSelector(
  (state: AppState) => state.docs.budgets,
  (state: AppState) => state.docs.bills,
  (state: AppState) => state,
  (budgets, billDocs, state) => {
    const doc = budgets[budgetId]
    if (!doc) {
      console.error(`invalid budgetId: `, budgetId)
      return
    }

    const categories = (doc.categories || [])
      .map(category => selectCategory(state, category)!)
      .filter(category => category !== undefined)
      .map(category => selectCategoryView(state, category._id))

    return ({
      doc,
      categories
    }) as Budget.View
  }
)

export const selectBudgets = createSelector(
  (state: AppState) => state.docs.budgets,
  (state: AppState) => state,
  (budgets, state) => {
    return Object.keys(budgets)
      .map((budgetId: Budget.DocId) => selectBudget(budgetId)(state)!)
      .filter(budget => !!budget)
      .sort(Budget.compareDoc)
  }
)

export const selectBudgetViews = createSelector(
  (state: AppState) => state.docs.budgets,
  (state: AppState) => state,
  (budgets, state) => {
    return Object.keys(budgets)
      .map((budgetId: Budget.DocId) => selectBudgetView(budgetId)(state)!)
      .filter(budget => !!budget)
      .sort(Budget.compare)
  }
)

export const selectCategory = createSelector(
  (state: AppState, categoryId: Category.DocId) => state.docs.categories,
  (state: AppState, categoryId: Category.DocId) => categoryId,
  (categories, categoryId) => {
    const doc = categories[categoryId]
    if (!doc) {
      console.error(`invalid categoryId: `, categoryId)
      return
    }
    return doc
  }
)

export const selectCategoryView = createSelector(
  (state: AppState, categoryId: Category.DocId) => state.docs.categories,
  (state: AppState, categoryId: Category.DocId) => state.docs.bills,
  (state: AppState, categoryId: Category.DocId) => state,
  (state: AppState, categoryId: Category.DocId) => categoryId,
  (categories, billDocs, state, categoryId) => {
    const doc = categories[categoryId]
    if (!doc) {
      console.error(`invalid categoryId: `, categoryId)
      return
    }

    const bills = Object.values(billDocs)
      .filter(bill => bill.category === doc._id)
      .map(bill => selectBillView(bill._id)(state))

    return {
      doc,
      bills
    } as Category.View
  }
)

export const selectTransaction = createSelector(
  (state: AppState, transactionId: Transaction.DocId) => state.docs.transactions,
  (state: AppState, transactionId: Transaction.DocId) => transactionId,
  (transactions, transactionId) => {
    const doc = transactions[transactionId]
    if (!doc) {
      console.error(`invalid transactionId: `, transactionId)
      return
    }
    return doc
  }
)

export const selectBillView = (billId: Bill.DocId) => createSelector(
  (state: AppState) => state.docs.bills,
  (state: AppState) => state,
  (bills, state) => {
    const doc = bills[billId]
    if (!doc) {
      console.error(`invalid billId: `, billId)
      return
    }
    return ({
      doc,
      rrule: RRule.fromString(doc.rruleString),
      account: doc.account && selectAccount(doc.account)(state),
      budget: doc.category && selectBudget(Category.budgetId(doc.category))(state),
      category: doc.category && selectCategory(state, doc.category)
    }) as Bill.View
  }
)

export const selectBills = createSelector(
  (state: AppState) => state.docs.bills,
  (bills) => {
    return Object.keys(bills)
  }
)

export const selectBillViews = createSelector(
  (state: AppState) => state.docs.bills,
  (state: AppState) => state,
  (bills, state) => {
    return Object.keys(bills)
      .map((billId: Bill.DocId) => selectBillView(billId)(state)!)
      .filter(bill => !!bill)
  }
)

export const selectSync = createSelector(
  (state: AppState, syncId: SyncConnection.DocId) => state.docs.syncConnections,
  (state: AppState, syncId: SyncConnection.DocId) => syncId,
  (syncConnections, syncId) => {
    const doc = syncConnections[syncId]
    if (!doc) {
      console.error(`invalid syncId: `, syncId)
      return
    }
    return doc
  }
)

export const selectSyncs = createSelector(
  (state: AppState) => state.docs.syncConnections,
  (state: AppState) => state,
  (syncConnections, state) => {
    return Object.keys(syncConnections)
      .map((syncId: SyncConnection.DocId) => selectSync(state, syncId)!)
      .filter(sync => !!sync)
  }
)
