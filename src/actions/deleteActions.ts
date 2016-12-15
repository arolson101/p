import { AppThunk } from '../state'
import { Institution, Account } from '../docs'

interface Deletion {
  _id: string
  _rev?: string
  _deleted: true
}

export const deleteInstitution = (institution: Institution.Doc): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().db
    if (!current) { throw new Error('no db') }
    let deletions: Deletion[] = []
    for (let accountid of institution.accounts) {
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
      _id: institution._id,
      _rev: institution._rev,
      _deleted: true
    })
    await current.db.bulkDocs(deletions)
  }

export const deleteAccount = (institution: Institution.Doc, account: Account.Doc): AppThunk =>
  async (dispatch, getState) => {
    const { current } = getState().db
    if (!current) { throw new Error('no db') }

    const idx = institution.accounts.indexOf(account._id)
    if (idx !== -1) {
      institution.accounts.splice(idx, 1)
    }

    let deletions: Deletion[] = []
    deletions.push({
      _id: account._id,
      _rev: account._rev,
      _deleted: true
    })
    // TODO: delete transactions
    await current.db.bulkDocs([institution, deletions])
  }
