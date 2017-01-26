import * as docURI from 'docuri'
import * as R from 'ramda'
import { sprintf } from 'sprintf-js'
import { makeid, Lookup } from '../util'
import { AppThunk } from '../state'
import { TCacheSetAction } from './index'
import { Bank } from './Bank'
import { Account } from './Account'
import { Transaction } from './Transaction'

export interface Statement {
  year: number
  month: number

  openingBalance: number
  transactionsCount: number
  transactionsAmount: number
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
    if (!year) {
      throw new Error('year must be set')
    }
    const _id = docId({
      bankId: aparams.bankId,
      accountId: aparams.accountId,
      statementId: sprintf('%d-%02d', year, month) as Id
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
      openingBalance: 0,
      transactionsCount: 0,
      transactionsAmount: 0,
    }
    return doc(account, statement)
  }

  export const addTransaction = (statement: Doc, transaction: Transaction, changes: ChangeSet): void => {
    if (!transaction.statement) {
      transaction.statement = statement._id
      statement.transactionsCount++
      statement.transactionsAmount += transaction.amount
      changes.add(transaction)
      changes.add(statement)
    }
  }

  export const baseIdForBank = (bank: Bank.Doc) => {
    const bparams = Bank.docId(bank._id)
    if (!bparams) {
      throw new Error('invalid bank docId ' + bank._id)
    }
    return docId({
      bankId: bparams.bankId,
      accountId: '' as Account.Id,
      statementId: '' as Id
    }).replace('//', '/')
  }

  export const baseIdForAccount = (account: Account.Doc) => {
    const aparams = Account.docId(account._id)
    if (!aparams) {
      throw new Error('invalid account docId ' + account._id)
    }
    return docId({
      bankId: aparams.bankId,
      accountId: aparams.accountId,
      statementId: '' as Id
    })
  }

  export const statementsForAccount = (statements: Cache, account: Account.Doc) => {
    const baseId = baseIdForAccount(account)
    const stmts = R.pipe(
      R.filter((stmt: Statement.Doc) => stmt._id.startsWith(baseId)),
      R.sortBy((stmt: Statement.Doc) => stmt._id)
    )(Array.from(statements.values()))
    return stmts
  }

  export const transactionsForStatement = (statement: Doc, transactions: Transaction.Doc[]) => {
    return transactions.filter(tx => tx.statement === statement._id)
  }

  export const updateBalances = (statements: Cache, account: Account.Doc, amount: number, asOfDate: Date, changes: ChangeSet) => {
    if (!account.ledgerBalanceDate || (account.ledgerBalance !== amount && asOfDate.valueOf() > account.ledgerBalanceDate)) {
      account.ledgerBalance = amount
      account.ledgerBalanceDate = asOfDate.valueOf()
      changes.add(account)
    }

    // update statement balances backwards
    const baseId = baseIdForAccount(account)
    const stmts = R.pipe(
      R.filter((stmt: Statement.Doc) => stmt._id.startsWith(baseId)),
      R.sortBy((stmt: Statement.Doc) => stmt._id),
      R.reverse
    )(Array.from(statements.values()))

    let balance = amount
    for (let stmt of stmts) {
      const openingBalance = balance - stmt.transactionsAmount
      if (stmt.openingBalance === openingBalance) {
        break
      }
      stmt.openingBalance = openingBalance
      balance = openingBalance
      changes.add(stmt)
    }
  }
}
