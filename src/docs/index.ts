export * from './Account'
export * from './DbInfo'
export * from './Bank'
export * from './Bill'
export * from './Category'
export * from './Statement'
export * from './Transaction'

import { Account } from './Account'
import { Bank } from './Bank'
import { Bill } from './Bill'
import { Category } from './Category'
import { Statement } from './Statement'
import { Transaction } from './Transaction'
import { Lookup } from '../Util'

export interface DocChangeAction {
  type: string
  handle: PouchDB.Database<any>
}

export const docChangeActionTesters = new Map([
  [Account.isDocId, Account.cacheUpdateAction],
  [Bank.isDocId, Bank.cacheUpdateAction],
  [Bill.isDocId, Bill.cacheUpdateAction],
  [Category.isDocId, Category.cacheUpdateAction],
  [Statement.isDocId, Statement.cacheUpdateAction]
])

export interface TCacheSetAction<T, Cache> {
  type: T
  cache: Cache
}

export interface DocCache {
  banks: Bank.Cache
  accounts: Account.Cache
  transactions: Transaction.Cache
  categories: Category.Cache
  bills: Bill.Cache
  statements: Statement.Cache
}
