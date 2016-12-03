export * from './account'
export * from './dbInfo'
export * from './institution'
export * from './transaction'

import { Account } from './account'
import { DbInfo } from './dbInfo'
import { Institution } from './institution'
import { Lookup } from '../util'

export const createIndices = async (db: PouchDB.Database<any>) => {
  type Indexer = (db: PouchDB.Database<any>) => Promise<any>
  const indexers: Indexer[] = [
    Account.createIndices
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
  [Institution.isDocId, Institution.cacheUpdateAction]
])

export interface TCacheSetAction<A, K, T> {
  type: A
  cache: Lookup<K, T>
}
