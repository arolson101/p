import { AppThunk } from '../state'
import { Bank, Account } from '../docs'

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
      }
      // TODO: delete transactions
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
    // TODO: delete transactions
    await current.db.bulkDocs([bank, deletions])
  }
