import { Bank, Account, Transaction } from '../docs'
import { AppThunk, ThunkFcn, Deletion, deleteDoc, deleteId, pushChanges } from '../state'
import { uiSetAccountDelete } from '../state/ui'

type DeleteAccountArgs = { bank: Bank.View, account: Account.View }
export namespace deleteAccount { export type Fcn = ThunkFcn<DeleteAccountArgs, boolean> }
export const deleteAccount: AppThunk<DeleteAccountArgs, boolean> = ({ bank, account }) =>
  async (dispatch, getState) => {
    try {
      dispatch(uiSetAccountDelete({ error: undefined, deleting: true }))

      const { db: { current } } = getState()
      if (!current) { throw new Error('no db') }

      const bankDoc = { ...bank.doc, accounts: [...bank.doc.accounts] }
      const idx = bankDoc.accounts.indexOf(account.doc._id)
      if (idx !== -1) {
        bankDoc.accounts.splice(idx, 1)
      }

      let docs: (Deletion | AnyDocument)[] = [bankDoc]
      docs.push(deleteDoc(account.doc))

      const transactions = await current.db.allDocs({
        include_docs: false,
        startkey: Transaction.startkeyForAccount(account),
        endkey: Transaction.endkeyForAccount(account)
      })
      for (let transaction of transactions.rows) {
        docs.push(deleteId(transaction.id, transaction.value.rev))
      }

      await dispatch(pushChanges({ docs }))

      dispatch(uiSetAccountDelete({ deleting: false }))
      return true

    } catch (error) {
      dispatch(uiSetAccountDelete({ error, deleting: false }))
      return false
    }
  }
