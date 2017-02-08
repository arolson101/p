export * from './Account'
export * from './Bank'
export * from './Bill'
export * from './Budget'
export * from './Category'
export * from './Transaction'

export { DbInfo } from '../state/db/DbInfo'

import { Account } from './Account'
import { Bank } from './Bank'
import { Bill } from './Bill'
import { Budget } from './Budget'
import { Category } from './Category'
import { Transaction } from './Transaction'

export interface DocCache {
  banks: Bank.Cache
  accounts: Account.Cache
  transactions: Transaction.Cache
  categories: Category.Cache
  bills: Bill.Cache
  budgets: Budget.Cache
}

export interface DbView {
  banks: Bank.View[]
  bills: Bill.View[]
  budgets: Budget.View[]
}
