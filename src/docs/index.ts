export * from './account'
export * from './dbInfo'
export * from './bank'
export * from './category'
export * from './transaction'

import { Account } from './account'
import { DbInfo } from './dbInfo'
import { Bank } from './bank'
import { Category } from './category'
import { Lookup } from '../util'

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
  [Category.isDocId, Category.cacheUpdateAction]
])

export interface TCacheSetAction<A, K, T> {
  type: A
  cache: Lookup<K, T>
}
