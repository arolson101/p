import * as docURI from 'docuri'
import * as R from 'ramda'
import { makeid, Lookup } from '../util'
import { AppThunk } from '../state'
import { TCacheSetAction } from './index'
import { Bank } from './Bank'
import { Account } from './Account'
import { Transaction } from './Transaction'

export interface Statement {
  year: number
  month: number

  transactionCount: number
  transactionsAmount: number
  endBalance: number
}

export namespace Statement {
  export type Id = ':statementId' | 'create' | makeid
  export type DocId = 'statement/:bankId/:accountId/:statementId'
  export type Doc = PouchDB.Core.Document<Statement> & { _id: DocId; _rev?: string }
  export interface Params { bankId: Bank.Id, accountId: Account.Id, statementId: Id }
  export const docId = docURI.route<Params, DocId>('statement/:bankId/:accountId/:statementId')
  export const startkey = 'statement/'
  export const endkey = 'statement/\uffff'
  export const all: PouchDB.Selector = {
    $and: [
      { _id: { $gt: startkey } },
      { _id: { $lt: endkey } }
    ]
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: Doc): boolean => {
    return !!docId(doc._id)
  }

  export const makeId = (account: Account.Doc, year: number, month: number): DocId => {
    const aparams = Account.docId(account._id)
    if (!aparams) {
      throw new Error('invalid accountId: ' + account._id)
    }
    if (!year || !month) {
      throw new Error('year and month must be set')
    }
    const _id = docId({
      bankId: aparams.bankId,
      accountId: aparams.accountId,
      statementId: `${year}-${month}` as Id
    })
    return _id
  }

  export const doc = (account: Account.Doc, statement: Statement): Doc => {
    const _id = makeId(account, statement.year, statement.month)
    return { _id, ...statement }
  }

  export const CHANGE_ACTION = 'statement/change'

  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type CACHE_SET = 'statement/cacheSet'
  export const CACHE_SET = 'statement/cacheSet'
  export type CacheSetAction = TCacheSetAction<CACHE_SET, DocId, Doc>
  export const cacheSetAction = (cache: Cache): CacheSetAction => ({
    type: CACHE_SET,
    cache
  })

  export const cacheUpdateAction = (handle?: PouchDB.Database<any>): AppThunk =>
    async (dispatch) => {
      const results = handle ? await handle.find({selector: all}) : { docs: [] }
      const cache = createCache(results.docs)
      dispatch(cacheSetAction(cache))
    }

  export const get = (statements: Cache, account: Account.Doc, date: Date) => {
    const statementId = makeId(account, date.getUTCFullYear(), date.getUTCMonth())
    return statements.get(statementId)
  }

  export const create = (account: Account.Doc, date: Date) => {
    const statement: Statement = {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      transactionCount: 0,
      transactionsAmount: 0,
      endBalance: 0,
    }
    return doc(account, statement)
  }

  export const addTransaction = (statement: Doc, transaction: Transaction): boolean => {
    if (transaction.statement) {
      return false
    }
    transaction.statement = statement._id
    statement.transactionCount++
    statement.transactionsAmount += transaction.amount
    return true
  }

  export const updateBalances = (statements: Cache, account: Account.Doc, amount: number, asOfDate: Date, changes: any[]) => {
    if (!account.ledgerBalanceDate || (account.ledgerBalance !== amount && asOfDate.valueOf() > account.ledgerBalanceDate)) {
      account.ledgerBalance = amount
      account.ledgerBalanceDate = asOfDate.valueOf()
      if (changes.indexOf(account) === -1) {
        changes.push(account)
      }
    }

    // update statement balances backwards
    const aparams = Account.docId(account._id)
    if (!aparams) {
      throw new Error('invalid account docId ' + account._id)
    }
    const baseId = docId({
      bankId: aparams.bankId,
      accountId: aparams.accountId,
      statementId: '' as Id
    })
    const stmts = R.pipe(
      R.filter((stmt: Statement.Doc) => stmt._id.startsWith(baseId)),
      R.sortBy((stmt: Statement.Doc) => stmt._id),
      R.reverse
    )(Array.from(statements.values()))

    let balance = amount
    for (let stmt of stmts) {
      if (stmt.endBalance === balance) {
        break
      }
      stmt.endBalance = balance
      balance -= stmt.transactionsAmount
      if (changes.indexOf(stmt) === -1) {
        changes.push(stmt)
      }
    }
  }
}
