export * from './Account'
export * from './DbInfo'
export * from './Bank'
export * from './Bill'
export * from './Category'
export * from './Transaction'

import { Account } from './Account'
import { DbInfo } from './DbInfo'
import { Bank } from './Bank'
import { Bill } from './Bill'
import { Category } from './Category'
import { Lookup } from '../Util'

export const createIndices = async (db: PouchDB.Database<any>) => {
  type Indexer = (db: PouchDB.Database<any>) => Promise<any>
  const indexers: Indexer[] = [
    // Account.createIndices
  ]
  for (let index of indexers) {
    await index(db)
  }
}

export interface DocChangeAction {
  type: string
  handle: PouchDB.Database<any>
}

export const docChangeActionTesters = new Map([
  [DbInfo.isDocId, DbInfo.cacheUpdateAction],
  [Account.isDocId, Account.cacheUpdateAction],
  [Bank.isDocId, Bank.cacheUpdateAction],
  [Bill.isDocId, Bill.cacheUpdateAction],
  [Category.isDocId, Category.cacheUpdateAction]
])

export interface TCacheSetAction<A, K, T> {
  type: A
  cache: Lookup<K, T>
}
