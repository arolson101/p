export * from './account'
export * from './dbInfo'
export * from './institution'
export * from './transaction'

import { Account } from './account'
import { DbInfo } from './dbInfo'
import { Institution } from './institution'
import { Transaction } from './transaction'
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

export const docChangeAction = (type: string, handle: PouchDB.Database<any>) => ({
  type,
  handle
})

export const docChangeActionTesters = {
  [DbInfo.CHANGE_ACTION]: DbInfo.isDocId,
  [Account.CHANGE_ACTION]: Account.isDocId,
  [Institution.CHANGE_ACTION]: Institution.isDocId,
  [Transaction.CHANGE_ACTION]: Transaction.isDocId
}

export interface TCacheSetAction<A, K, T> {
  type: A
  cache: Lookup<K, T>
}
