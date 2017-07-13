import * as docURI from 'docuri'
import { createSelector } from 'reselect'
import { RouteComponentProps } from 'react-router'
import * as RRule from 'rrule-alt'
import { AppState } from './state/index'
import { Bank, Account, Transaction, Bill, Category, Budget, SyncConnection } from './docs/index'

interface MinRouteProps<T> {
  match: {
    params: T
  }
}

const minRouteProps = <ID, T>(fcn: docURI.Route<T, ID>, id: ID): MinRouteProps<T> => {
  const params = fcn(id)
  if (!params) {
    throw new Error(`invalid id: ${id}`)
  }
  return ({
    match: {
      params: params as T
    }
  })
}

const debugSelector = (name: string, id?: string) => {
  // console.log(`selector ${name} running for '${id}`)
}

export const selectBank = createSelector(
  (state: AppState, props: MinRouteProps<Bank.Params> | undefined) => state.docs.banks,
  (state: AppState, props: MinRouteProps<Bank.Params> | undefined) => state.docs.accounts,
  (state: AppState, props: MinRouteProps<Bank.Params> | undefined) => props && Bank.docId(props.match.params),
  (banks, accounts, bankId): Bank.View | undefined => {
    debugSelector('selectBank', bankId)
    const doc = bankId && banks[bankId]
    if (!doc) {
      console.error(`invalid bankId: `, bankId)
      return
    }
    return ({
      doc,
      accounts: (doc.accounts || [])
        .map(accountId => accounts[accountId])
        .filter((account?: Account.Doc) => account !== undefined)
    })
  }
)

export const selectBanks = createSelector(
  (state: AppState) => state.docs.banks,
  (state: AppState) => state,
  (banks, state): Bank.View[] => {
    debugSelector('selectBanks')
    return Object.keys(banks)
      .map((bankId: Bank.DocId) => selectBank(state, minRouteProps(Bank.docId, bankId))!)
      .filter(bank => !!bank)
  }
)

export const selectAccount = createSelector(
  (state: AppState, props: MinRouteProps<Account.Params> | undefined) => state.docs.accounts,
  (state: AppState, props: MinRouteProps<Account.Params> | undefined) => props && Account.docId(props.match.params),
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

export const selectBudget = createSelector(
  (state: AppState, props: MinRouteProps<Budget.Params> | undefined) => state.docs.budgets,
  (state: AppState, props: MinRouteProps<Budget.Params> | undefined) => props && Budget.docId(props.match.params),
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

export const selectBudgetView = createSelector(
  (state: AppState, props: MinRouteProps<Budget.Params> | undefined) => state.docs.budgets,
  (state: AppState, props: MinRouteProps<Budget.Params> | undefined) => state.docs.bills,
  (state: AppState, props: MinRouteProps<Budget.Params> | undefined) => state,
  (state: AppState, props: MinRouteProps<Budget.Params> | undefined) => props && Budget.docId(props.match.params),
  (budgets, billDocs, state, budgetId): Budget.View | undefined => {
    debugSelector('selectBudgetView', budgetId)
    const doc = budgetId && budgets[budgetId]
    if (!doc) {
      console.error(`invalid budgetId: `, budgetId)
      return
    }

    const categories: Category.View[] = (doc.categories || [])
      .map(category => selectCategoryView(state, minRouteProps(Category.docId, category))!)
      .filter(category => !!category)

    return ({
      doc,
      categories
    })
  }
)

export const selectBudgets = createSelector(
  (state: AppState) => state.docs.budgets,
  (state: AppState) => state,
  (budgets, state): Budget.Doc[] => {
    debugSelector('selectBudgets')
    return Object.keys(budgets)
      .map((budgetId: Budget.DocId) => selectBudget(state, minRouteProps(Budget.docId, budgetId))!)
      .filter(budget => !!budget)
      .sort(Budget.compareDoc)
  }
)

export const selectBudgetViews = createSelector(
  (state: AppState) => state.docs.budgets,
  (state: AppState) => state,
  (budgets, state): Budget.View[] => {
    debugSelector('selectBudgetViews')
    return Object.keys(budgets)
      .map((budgetId: Budget.DocId) => selectBudgetView(state, minRouteProps(Budget.docId, budgetId))!)
      .filter(budget => !!budget)
      .sort(Budget.compare)
  }
)

export const selectCategory = createSelector(
  (state: AppState, props: MinRouteProps<Category.Params> | undefined) => state.docs.categories,
  (state: AppState, props: MinRouteProps<Category.Params> | undefined) => props && Category.docId(props.match.params),
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

export const selectCategoryView = createSelector(
  (state: AppState, props: MinRouteProps<Category.Params> | undefined) => state.docs.categories,
  (state: AppState, props: MinRouteProps<Category.Params> | undefined) => state.docs.bills,
  (state: AppState, props: MinRouteProps<Category.Params> | undefined) => state,
  (state: AppState, props: MinRouteProps<Category.Params> | undefined) => props && Category.docId(props.match.params),
  (categories, billDocs, state, categoryId): Category.View | undefined => {
    debugSelector('selectCategoryView', categoryId)
    const doc = categoryId && categories[categoryId]
    if (!doc) {
      console.error(`invalid categoryId: `, categoryId)
      return
    }

    const bills: Bill.View[] = Object.values(billDocs)
      .filter(bill => bill.category === doc._id)
      .map(bill => selectBillView(state, minRouteProps(Bill.docId, bill._id))!)
      .filter(bill => !!bill)

    return {
      doc,
      bills
    }
  }
)

export const selectTransaction = createSelector(
  (state: AppState, props: MinRouteProps<Transaction.Params> | undefined) => state.docs.transactions,
  (state: AppState, props: MinRouteProps<Transaction.Params> | undefined) => props && Transaction.docId(props.match.params),
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

export const selectBillView = createSelector(
  (state: AppState, props: MinRouteProps<Bill.Params> | undefined) => state.docs.bills,
  (state: AppState, props: MinRouteProps<Bill.Params> | undefined) => state,
  (state: AppState, props: MinRouteProps<Bill.Params> | undefined) => props && Bill.docId(props.match.params),
  (bills, state, billId): Bill.View | undefined => {
    debugSelector('selectBillView', billId)
    const doc = billId && bills[billId]
    if (!doc) {
      console.error(`invalid billId: `, billId)
      return
    }
    return ({
      doc,
      rrule: RRule.fromString(doc.rruleString),
      account: doc.account && selectAccount(state, minRouteProps(Account.docId, doc.account)),
      budget: doc.category && selectBudget(state, minRouteProps(Category.docId, doc.category)),
      category: doc.category && selectCategory(state, minRouteProps(Category.docId, doc.category))
    })
  }
)

export const selectBills = createSelector(
  (state: AppState) => state.docs.bills,
  (bills): Bill.Doc[] => {
    debugSelector('selectBills')
    return Object.values(bills)
  }
)

export const selectBillViews = createSelector(
  (state: AppState) => state.docs.bills,
  (state: AppState) => state,
  (bills, state): Bill.View[] => {
    debugSelector('selectBillViews')
    return Object.keys(bills)
      .map((billId: Bill.DocId) => selectBillView(state, minRouteProps(Bill.docId, billId))!)
      .filter(bill => !!bill)
  }
)

export const selectSync = createSelector(
  (state: AppState, props: MinRouteProps<SyncConnection.Params> | undefined) => state.docs.syncConnections,
  (state: AppState, props: MinRouteProps<SyncConnection.Params> | undefined) => props && SyncConnection.docId(props.match.params),
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
  (state: AppState) => state,
  (syncConnections, state): SyncConnection.Doc[] => {
    debugSelector('selectSyncs')
    return Object.keys(syncConnections)
      .map((syncId: SyncConnection.DocId) => selectSync(state, minRouteProps(SyncConnection.docId, syncId))!)
      .filter(sync => !!sync)
  }
)
