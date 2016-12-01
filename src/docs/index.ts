export * from './account'
export * from './dbInfo'
export * from './institution'
export * from './transaction'

import { Account } from './account'

export const createIndices = async (db: PouchDB.Database<any>) => {
  type Indexer = (db: PouchDB.Database<any>) => Promise<any>
  const indexers: Indexer[] = [
    Account.createIndices
  ]
  for (let index of indexers) {
    await index(db)
  }
}
