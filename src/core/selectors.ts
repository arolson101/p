import { createSelector } from 'reselect'
import { AppState } from './state'
import { Bank, Account, Transaction, Bill, Category, Budget, SyncConnection } from './docs'

const debugSelector = (name: string, id?: string) => {
  // console.log(`selector ${name} running for '${id}'`)
}

export const selectBank = createSelector(
  (state: AppState, bankId: Bank.DocId | undefined) => state.views.banks,
  (state: AppState, bankId: Bank.DocId | undefined) => bankId,
  (banks, bankId): Bank.View | undefined => {
    debugSelector('selectBank', bankId)
    const doc = bankId && banks[bankId]
    if (!doc) {
      console.error(`invalid bankId: `, bankId)
    }
    return doc
  }
)

export const selectBanks = createSelector(
  (state: AppState) => state.views.banks,
  (banks): Bank.View[] => {
    debugSelector('selectBanks')
    return Object.values(banks)
  }
)

export const selectBankAccounts = createSelector(
  (state: AppState, bankId: Bank.DocId | undefined) => state.views.banks,
  (state: AppState, bankId: Bank.DocId | undefined) => state.views.accounts,
  (state: AppState, bankId: Bank.DocId | undefined) => bankId,
  (banks, accounts, bankId): Account.View[] => {
    debugSelector('selectBankAccounts', bankId)
    const view = bankId && banks[bankId]
    if (!view) {
      console.error(`invalid bankId: `, bankId)
    }
    return (view ? view.doc.accounts : [])
      .map(accountId => accounts[accountId])
      .filter(account => !!account)
  }
)

export const selectAccount = createSelector(
  (state: AppState, accountId: Account.DocId | undefined) => state.views.accounts,
  (state: AppState, accountId: Account.DocId | undefined) => accountId,
  (accounts, accountId): Account.View | undefined => {
    debugSelector('selectAccount', accountId)
    const doc = accountId && accounts[accountId]
    if (!doc) {
      console.error(`invalid accountId: `, accountId)
      return undefined
    }
    return doc
  }
)

export const selectAccounts = createSelector(
  (state: AppState) => state.views.accounts,
  (accounts): Account.View[] => {
    debugSelector('selectAccounts')
    return Object.values(accounts)
  }
)

export const selectBudget = createSelector(
  (state: AppState, budgetId: Budget.DocId | undefined) => state.views.budgets,
  (state: AppState, budgetId: Budget.DocId | undefined) => budgetId,
  (budgets, budgetId): Budget.View | undefined => {
    debugSelector('selectBudget', budgetId)
    const doc = budgetId && budgets[budgetId]
    if (!doc) {
      console.error(`invalid budgetId: `, budgetId)
      return undefined
    }
    return doc
  }
)

export const selectBudgets = createSelector(
  (state: AppState) => state.views.budgets,
  (budgets): Budget.View[] => {
    debugSelector('selectBudgets')
    return Object.values(budgets)
      .sort(Budget.compare)
  }
)

export const selectCategory = createSelector(
  (state: AppState, categoryId: Category.DocId | undefined) => state.views.categories,
  (state: AppState, categoryId: Category.DocId | undefined) => categoryId,
  (categories, categoryId): Category.View | undefined => {
    debugSelector('selectCategory', categoryId)
    const doc = categoryId && categories[categoryId]
    if (!doc) {
      console.error(`invalid categoryId: `, categoryId)
      return undefined
    }
    return doc
  }
)

export const selectCategories = createSelector(
  (state: AppState) => state.views.categories,
  (categories): Category.View[] => {
    debugSelector('selectCategories')
    return Object.values(categories)
  }
)

export const selectCategoriesForBudget = createSelector(
  (state: AppState, budgetId: Budget.DocId | undefined) => state.views.budgets,
  (state: AppState, budgetId: Budget.DocId | undefined) => state.views.categories,
  (state: AppState, budgetId: Budget.DocId | undefined) => budgetId,
  (budgets, categories, budgetId): Category.View[] => {
    debugSelector('selectCategoriesForBudget', budgetId)
    const view = budgetId && budgets[budgetId]
    if (!view) {
      console.error('invalid budgetId: ', budgetId)
    }
    return (view ? view.doc.categories : [])
      .map(categoryId => categories[categoryId])
      .filter(category => !!category)
  }
)

export const selectBillsForCategory = createSelector(
  (state: AppState, categoryId: Category.DocId | undefined) => state.views.bills,
  (state: AppState, categoryId: Category.DocId | undefined) => categoryId,
  (bills, categoryId): Bill.View[] => {
    return Object.values(bills)
      .filter(bill => bill.doc.category === categoryId)
  }
)

export const selectTransactions = createSelector(
  (state: AppState, accountId: Account.DocId) => accountId && state.views.accounts[accountId],
  (state: AppState, accountId: Account.DocId) => state.views.transactions,
  (account, transactions): Transaction.View[] => {
    if (!account) {
      console.error(`invalid accountId`)
      return []
    }

    const aparts = Account.docId(account.doc._id)
    if (!aparts) {
      console.error(`invalid account docId`)
      return []
    }

    const docs = Object.values(transactions)
      .filter(t => {
        const tid = Transaction.docId(t.doc._id)
        return tid && tid.bankId === aparts.bankId && tid.accountId === aparts.accountId
      })
      .sort((a, b) => a.time.valueOf() - b.time.valueOf())

    return docs
  }
)

export const selectTransaction = createSelector(
  (state: AppState, transactionId: Transaction.DocId | undefined) => state.views.transactions,
  (state: AppState, transactionId: Transaction.DocId | undefined) => transactionId,
  (transactions, transactionId): Transaction.View | undefined => {
    debugSelector('selectTransaction', transactionId)
    const doc = transactionId && transactions[transactionId]
    if (!doc) {
      console.error(`invalid transactionId: `, transactionId)
      return undefined
    }
    return doc
  }
)

export const selectBills = createSelector(
  (state: AppState) => state.views.bills,
  (bills): Bill.View[] => {
    debugSelector('selectBills')
    return Object.values(bills)
  }
)

export const selectSync = createSelector(
  (state: AppState, syncId: SyncConnection.DocId | undefined) => state.views.syncConnections,
  (state: AppState, syncId: SyncConnection.DocId | undefined) => syncId,
  (syncConnections, syncId): SyncConnection.Doc | undefined => {
    debugSelector('selectSync', syncId)
    const doc = syncId && syncConnections[syncId]
    if (!doc) {
      console.error(`invalid syncId: `, syncId)
      return undefined
    }
    return doc
  }
)

export const selectSyncs = createSelector(
  (state: AppState) => state.views.syncConnections,
  (syncConnections): SyncConnection.Doc[] => {
    debugSelector('selectSyncs')
    return Object.values(syncConnections)
  }
)
