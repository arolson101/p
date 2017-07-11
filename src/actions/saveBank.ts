import { InjectedIntl } from 'react-intl'
import { replace } from 'react-router-redux'
import { AppThunk, ThunkFcn, FI, pushChanges } from '../state/index'
import { Bank } from '../docs/index'
import { Validator } from '../util/validator'

let injectedIntl: InjectedIntl
type FormatMessage = typeof injectedIntl.formatMessage

interface Params {
  edit?: Bank.Doc
  filist: FI[]
  formatMessage: FormatMessage
  values: saveBank.Values
}

type Return = Bank.Doc

export namespace saveBank {
  export type Fcn = ThunkFcn<Params, Return>
  export interface Values {
    fi: number

    name: string
    web: string
    address: string
    notes: string
    favicon: string

    online: boolean

    fid: string
    org: string
    ofx: string

    username: string
    password: string
  }
}

export const saveBank: AppThunk<Params, Return> = ({edit, formatMessage, values, filist}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    const v = new Validator(values, formatMessage)
    v.required('name')
    v.maybeThrowSubmissionError()

    const { fi, username, password, ...newValues } = values
    const bank: Bank.Doc = Bank.doc({
      accounts: [],

      ...edit,
      ...newValues,

      fi: fi ? filist[fi - 1].name : undefined,
      login: {
        username: username,
        password: password
      }
    })
    await dispatch(pushChanges({docs: [bank]}))

    return bank
  }
