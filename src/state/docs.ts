import { combineReducers } from 'redux'
import { Account, Bank, Bill, Budget, Category, LocalDoc, SyncConnection, Transaction } from '../docs/index'
import { AppThunk, ThunkFcn } from './index'
import { DB_CHANGES, DbChangesAction, DB_SET_CURRENT, SetDbAction, resolveConflicts } from './db/index'

interface Cache<T> {
  [id: string]: T
}

export interface DocsState {
  accounts: Cache<Account.Doc>
  banks: Cache<Bank.Doc>
  bills: Cache<Bill.Doc>
  budgets: Cache<Budget.Doc>
  categories: Cache<Category.Doc>
  localdocs: Cache<LocalDoc.Doc>
  syncConnections: Cache<SyncConnection.Doc>
  transactions: Cache<Transaction.Doc>
}

export const DOCS_INIT = 'docs/init'
export interface DocsInitAction {
  type: typeof DOCS_INIT
  docs: AnyDocument[]
}

const docsInit = (docs: AnyDocument[]): DocsInitAction => ({
  type: DOCS_INIT,
  docs,
})

const allDocsQueries = [
  Bank.allDocs,
  Account.allDocs,
  Category.allDocs,
  Bill.allDocs,
  Budget.allDocs,
]

type InitDocsArgs = { db: PouchDB.Database }
export namespace InitDocs { export type Fcn = ThunkFcn<InitDocsArgs, void> }
export const initDocs: AppThunk<InitDocsArgs, void> = ({db}) =>
  async (dispatch, getState) => {
    const local = await safeGet<LocalDoc.Doc>(db, LocalDoc.DocId) || LocalDoc.create()
    const localDocs: AnyDocument[] = []
    for (let id in local.ids) {
      const doc = await safeGet<AnyDocument | undefined>(db, id)
      if (doc) {
        localDocs.push(doc)
      }
    }

    let docs: AnyDocument[] = []
    for (let opts of allDocsQueries) {
      const allDocs = await db.allDocs({include_docs: true, conflicts: true, ...opts})
      docs.push(...allDocs.rows.map(row => row.doc!))
    }
    docs.push(local)
    docs.push(...localDocs)
    resolveConflicts(db, ...docs)

    dispatch(docsInit(docs))
  }

const safeGet = async <T> (db: PouchDB.Database<any>, id: string): Promise<T | undefined> => {
  try {
    return await db.get(id) as T
  } catch (err) {
    if (err.name !== 'not_found') {
      throw err
    }
  }
}

type Actions<T> = DbChangesAction<T> | DocsInitAction | SetDbAction | EmptyAction
const initialState = {}

const docReducer = <T>(isDoc: (id: string) => boolean) =>
  (state: Cache<T> = initialState, action: Actions<T>): Cache<T> => {
    switch (action.type) {
      case DB_SET_CURRENT:
        return initialState

      case DOCS_INIT:
        return action.docs
          .filter(doc => isDoc(doc._id))
          .reduce((obj, val) => ({...obj, [val._id]: val}), {})

      case DB_CHANGES:
        const changes = action.changes.filter(change => isDoc(change.id))
        if (changes.length) {
          const nextState = { ...state }
          for (let change of action.changes) {
            if (change.deleted) {
              delete nextState[change.id]
            } else {
              if (!change.doc) {
                throw new Error(`change ${change.id} has no document`)
              }
              nextState[change.id] = change.doc
            }
          }
          return nextState
        }
        return state

      default:
        return state
    }
  }

const reducer = combineReducers({
  accounts: docReducer(Account.isDocId),
  banks: docReducer(Bank.isDocId),
  bills: docReducer(Bill.isDocId),
  budgets: docReducer(Budget.isDocId),
  categories: docReducer(Category.isDocId),
  localdocs: docReducer(LocalDoc.isDocId),
  syncConnections: docReducer(SyncConnection.isDocId),
  transactions: docReducer(Transaction.isDocId),
})

export interface DocsSlice {
  docs: DocsState
}

export const DocsSlice = {
  docs: reducer
}
