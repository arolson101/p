import { InjectedIntl } from 'react-intl'
import { replace } from 'react-router-redux'
import { AppThunk, ThunkFcn, pushChanges } from '../state/index'
import { Bank, Account } from '../docs/index'
import { Validator } from '../util/validator'

let injectedIntl: InjectedIntl
type FormatMessage = typeof injectedIntl.formatMessage

interface Params {
  bank: Bank.View
  edit?: Account.View
  formatMessage: FormatMessage
  values: saveAccount.Values
}

type Return = Account.Doc

export namespace saveAccount {
  export type Fcn = ThunkFcn<Params, Return>
  export interface Values {
    color: string
    name: string
    number: string
    type: Account.Type
    bankid: string
    key: string
  }
}

export const saveAccount: AppThunk<Params, Return> = ({bank, edit, formatMessage, values}) =>
  async (dispatch, getState) => {
    const v = new Validator(values, formatMessage)
    v.required('name', 'number', 'type')
    v.maybeThrowSubmissionError()

    const account = Account.doc(
      bank.doc,
      {
        visible: true,
        ...edit,
        ...values,
      }
    )

    const docs: AnyDocument[] = [account]
    if (!edit) {
      const nextBank: Bank.Doc = {
        ...bank.doc,
        accounts: [...bank.doc.accounts, account._id]
      }
      docs.push(nextBank)
    }

    await dispatch(pushChanges({docs}))

    return account
  }
