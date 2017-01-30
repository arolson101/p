import { AppThunk, CurrentDb } from '../state'
import { Bank, Account, Transaction } from '../docs'

interface Deletion {
  _id: string
  _rev?: string
  _deleted: true
}

export const deleteBank = (bank: Bank.Doc): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().db
    if (!current) { throw new Error('no db') }
    let deletions: Deletion[] = []
    for (let accountid of bank.accounts) {
      const account = current.cache.accounts.get(accountid)
      if (account) {
        deletions.push({
          _id: account._id,
          _rev: account._rev,
          _deleted: true
        })
        const transactions = await getTransactions(current, account)
        deletions.push(...transactions)
      }
    }
    deletions.push({
      _id: bank._id,
      _rev: bank._rev,
      _deleted: true
    })
    await current.db.bulkDocs(deletions)
  }

export const deleteAccount = (bank: Bank.Doc, account: Account.Doc): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().db
    if (!current) { throw new Error('no db') }

    const idx = bank.accounts.indexOf(account._id)
    if (idx !== -1) {
      bank.accounts.splice(idx, 1)
    }

    let deletions: Deletion[] = []
    deletions.push({
      _id: account._id,
      _rev: account._rev,
      _deleted: true
    })

    const transactions = await getTransactions(current, account)
    deletions.push(...transactions)

    await current.db.bulkDocs([bank, ...deletions])
  }

const getTransactions = async (current: CurrentDb, account: Account.Doc): Promise<Deletion[]> => {
  const results = await current.db.allDocs({
    startkey: Transaction.startkeyForAccount(account),
    endkey: Transaction.endkeyForAccount(account),
    include_docs: false
  })
  return results.rows.map(row => ({_id: row.id, _rev: row.value.rev, _deleted: true } as Deletion))
}

export const deleteTransactions = (account: Account.Doc): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().db
    if (!current) { throw new Error('no db') }

    let deletions: Deletion[] = await getTransactions(current, account)

    const transactions = await getTransactions(current, account)
    deletions.push(...transactions)

    await current.db.bulkDocs(deletions)
  }
