import * as moment from 'moment'
import * as numeral from 'numeral'
import * as PropTypes from 'prop-types'
import * as R from 'ramda'
import * as React from 'react'
import { InjectedIntl, FormattedMessage } from 'react-intl'
import { replace } from 'react-router-redux'
import * as Rx from 'rxjs/Rx'
import { AppThunk, ThunkFcn, FI, pushChanges } from '../state/index'
import { Bill, Account, Budget } from '../docs/index'
import { toRRule, RRuleErrorMessage, Validator } from '../util/index'

export { toRRule, RRuleErrorMessage }

let injectedIntl: InjectedIntl
type FormatMessage = typeof injectedIntl.formatMessage

interface Params {
  edit?: Bill.Doc
  formatMessage: FormatMessage
  values: saveBill.Values
}

type Return = Bill.Doc

export namespace saveBill {
  export type Fcn = ThunkFcn<Params, Return>

  export interface Values extends toRRule.Values {
    name: string
    group: string
    web: string
    notes: string
    amount: string
    account?: Account.DocId
    category: string
    favicon?: string
    showAdvanced?: boolean
  }
}

export const saveBill: AppThunk<Params, Return> = ({edit, formatMessage, values}) =>
  async (dispatch, getState) => {
    const { db: { current } } = getState()
    if (!current) { throw new Error('no db') }

    const v = new Validator(values, formatMessage)
    v.required('group', 'name', 'amount', 'start')

    const rrule = toRRule(values)
    if (rrule instanceof RRuleErrorMessage) {
      v.errors[rrule.field] = formatMessage(rrule.message)
    }

    v.maybeThrowSubmissionError()

    const { amount, frequency, start, end, until, count, interval, byweekday, bymonth, category, ...rest } = values
    const docs: AnyDocument[] = []

    const bill: Bill.Doc = Bill.doc({
      ...edit,
      ...rest,
      amount: numeral(amount).value(),
      category: Budget.maybeCreateCategory(category, current.view.budgets, docs),
      rruleString: rrule.toString()
    })
    docs.push(bill)
    await dispatch(pushChanges({docs}))

    return bill
  }
