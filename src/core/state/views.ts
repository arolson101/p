import { combineReducers } from 'redux'
import { Account, Bank, Bill, Budget, Category, LocalDoc, SyncConnection, Transaction } from '../docs'
import { AppThunk, ThunkFcn } from './'
import { DB_CHANGES, DbChangesAction, DB_SET_CURRENT, SetDbAction, resolveConflicts } from './db'

export interface Cache<T> {
  [id: string]: T
}

export interface ViewsState {
  accounts: Cache<Account.View>
  banks: Cache<Bank.View>
  bills: Cache<Bill.View>
  budgets: Cache<Budget.View>
  categories: Cache<Category.View>
  localdocs: Cache<LocalDoc.Doc>
  syncConnections: Cache<SyncConnection.Doc>
  transactions: Cache<Transaction.View>
}

export const DOCS_SET = 'docs/set'
export interface DocsInitAction {
  type: typeof DOCS_SET
  docs: AnyDocument[]
}

export const setDocs = (docs: AnyDocument[]): DocsInitAction => ({
  type: DOCS_SET,
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

    dispatch(setDocs(docs))
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

const docReducer = <T>(isDocId: (id: string) => boolean, buildView: (doc: AnyDocument) => T) =>
  (state: Cache<T> = initialState, action: Actions<T>): Cache<T> => {
    switch (action.type) {
      case DB_SET_CURRENT:
        return initialState

      case DOCS_SET:
        return action.docs
          .filter(doc => isDocId(doc._id))
          .reduce((obj, val) => ({...obj, [val._id]: buildView(val)}), {})

      case DB_CHANGES:
        const changes = action.changes.filter(change => isDocId(change.id))
        if (changes.length) {
          const nextState = { ...state }
          for (let change of changes) {
            if (change.deleted) {
              delete nextState[change.id]
            } else {
              if (!change.doc) {
                throw new Error(`change ${change.id} has no document`)
              }
              nextState[change.id] = buildView(change.doc)
            }
          }
          return nextState
        }
        return state

      default:
        return state
    }
  }

const docIsView = (doc: AnyDocument) => doc

const reducer = combineReducers({
  accounts: docReducer(Account.isDocId, Account.buildView),
  banks: docReducer(Bank.isDocId, Bank.buildView),
  bills: docReducer(Bill.isDocId, Bill.buildView),
  budgets: docReducer(Budget.isDocId, Budget.buildView),
  categories: docReducer(Category.isDocId, Category.buildView),
  localdocs: docReducer(LocalDoc.isDocId, docIsView),
  syncConnections: docReducer(SyncConnection.isDocId, docIsView),
  transactions: docReducer(Transaction.isDocId, Transaction.buildView),
})

export interface ViewsSlice {
  views: ViewsState
}

export const ViewsSlice = {
  views: reducer
}
