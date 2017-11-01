import * as R from 'ramda'

export * from './Account'
export * from './Bank'
export * from './Bill'
export * from './Budget'
export * from './Category'
export * from './LocalDocs'
export * from './SyncConnection'
export * from './Transaction'

export { DbInfo } from '../state/db'

import { Account } from './Account'
import { Bank } from './Bank'
import { Bill } from './Bill'
import { Budget } from './Budget'
import { Category } from './Category'
import { LocalDoc } from './LocalDocs'
import { SyncConnection } from './SyncConnection'
import { Transaction } from './Transaction'

export interface DocCache {
  local: LocalDoc.Doc
  banks: Bank.Cache
  accounts: Account.Cache
  transactions: Transaction.Cache
  categories: Category.Cache
  bills: Bill.Cache
  budgets: Budget.Cache
  syncs: SyncConnection.Cache
}

export namespace DocCache {
  export const allDocs = [
    Bank.allDocs,
    Account.allDocs,
    Category.allDocs,
    Bill.allDocs,
    Budget.allDocs,
  ]

  export const create = (): DocCache => ({
    local: LocalDoc.create(),
    banks: Bank.createCache(),
    accounts: Account.createCache(),
    transactions: Transaction.createCache(),
    categories: Category.createCache(),
    bills: Bill.createCache(),
    budgets: Budget.createCache(),
    syncs: SyncConnection.createCache(),
  })

  export const copy = (cache: DocCache): DocCache => {
    return ({
      local: cache.local,
      banks: new Map(cache.banks),
      accounts: new Map(cache.accounts),
      transactions: new Map(cache.transactions),
      categories: new Map(cache.categories),
      bills: new Map(cache.bills),
      budgets: new Map(cache.budgets),
      syncs: new Map(cache.syncs),
    })
  }

  export const addDocsToCache = (docs: AnyDocument[]) => {
    const cache = create()
    docs.forEach(
      R.cond([
        [Transaction.isDoc, (doc: Transaction.Doc) => cache.transactions.set(doc._id, doc)],
        [Bank.isDoc, (doc: Bank.Doc) => cache.banks.set(doc._id, doc)],
        [Account.isDoc, (doc: Account.Doc) => cache.accounts.set(doc._id, doc)],
        [Category.isDoc, (doc: Category.Doc) => cache.categories.set(doc._id, doc)],
        [Bill.isDoc, (doc: Bill.Doc) => cache.bills.set(doc._id, doc)],
        [Budget.isDoc, (doc: Budget.Doc) => cache.budgets.set(doc._id, doc)],
        [SyncConnection.isDoc, (doc: SyncConnection.Doc) => cache.syncs.set(doc._id, doc)],
        [LocalDoc.isDoc, (doc: LocalDoc.Doc) => cache.local = doc]
      ]) as (doc: AnyDocument) => void
    )
    return cache
  }

  export const updateCache = (currentCache: DocCache, changes: PouchDB.ChangeInfo<AnyDocument>[]) => {
    const nextCache = copy(currentCache)
    const selectCache = R.cond([
      [Transaction.isDocId, R.always(nextCache.transactions)],
      [Bank.isDocId, R.always(nextCache.banks)],
      [Account.isDocId, R.always(nextCache.accounts)],
      [Category.isDocId, R.always(nextCache.categories)],
      [Bill.isDocId, R.always(nextCache.bills)],
      [Budget.isDocId, R.always(nextCache.budgets)],
      [SyncConnection.isDocId, R.always(nextCache.syncs)],
    ]) as (docId: string) => Map<string, AnyDocument> | undefined

    const isDeletion = (change: PouchDB.ChangeInfo<AnyDocument>): boolean => !!change.deleted
    const deleteItem = (change: PouchDB.ChangeInfo<AnyDocument>): void => {
      const map = selectCache(change.id)
      if (map) {
        map.delete(change.id)
      }
    }

    const upsertItem = (change: PouchDB.ChangeInfo<AnyDocument>): void => {
      const map = selectCache(change.id)
      if (map) {
        console.assert(change.doc)
        map.set(change.id, change.doc!)
      } else if (change.doc) {
        const doc = change.doc
        if (LocalDoc.isDoc(doc)) {
          nextCache.local = doc
        }
      }
    }

    R.forEach(
      R.cond([
        [isDeletion, deleteItem],
        [R.T, upsertItem]
      ]) as (change: PouchDB.ChangeInfo<AnyDocument>) => void,
      changes
    )

    return nextCache
  }
}
