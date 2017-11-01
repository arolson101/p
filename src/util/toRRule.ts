import * as moment from 'moment'
import * as RRule from 'rrule-alt'
import { defineMessages, FormattedMessage } from 'react-intl'

const messages = defineMessages({
  invalidStartDate: {
    id: 'toRRule.invalidStartDate',
    defaultMessage: 'Invalid start date'
  },
  invalidUntilDate: {
    id: 'toRRule.invalidUntilDate',
    defaultMessage: 'Invalid end date'
  },
})

export class RRuleErrorMessage {
  field: keyof toRRule.Values
  message: FormattedMessage.MessageDescriptor

  constructor (field: keyof toRRule.Values, formattedMessage: FormattedMessage.MessageDescriptor) {
    this.field = field
    this.message = formattedMessage
  }
}

export namespace toRRule {
  export type Frequency = 'days' | 'weeks' | 'months' | 'years'
  export type EndType = 'endDate' | 'endCount'

  export interface Values {
    frequency: Frequency
    start?: string
    end?: EndType
    until?: string
    count?: number
    interval?: number
    byweekday?: string
    bymonth?: string
  }
  export type Error = RRuleErrorMessage
}

const toRRuleFreq = {
  days: RRule.DAILY,
  weeks: RRule.WEEKLY,
  months: RRule.MONTHLY,
  years: RRule.YEARLY
} as { [f: string]: RRule.Frequency }

const rruleDays = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA]

export const toRRule = (params: toRRule.Values): RRule | RRuleErrorMessage => {
  const { frequency, start, end, until, count, interval, byweekday, bymonth } = params
  const date = moment(start, 'L')
  if (!date.isValid()) {
    return new RRuleErrorMessage('start', messages.invalidStartDate)
  }

  const opts: RRule.Options = {
    freq: toRRuleFreq[frequency],
    dtstart: date.toDate()
  }

  if (interval) {
    opts.interval = +interval
  }
  if (byweekday) {
    opts.byweekday = byweekday.split(',').map(x => rruleDays[+x])
  }
  if (bymonth) {
    opts.bymonth = bymonth.split(',').map(x => +x)
  }

  if (end === 'endDate') {
    const untilDate = moment(until, 'L')
    if (!untilDate.isValid()) {
      return new RRuleErrorMessage('until', messages.invalidUntilDate)
    }
    opts.until = untilDate.toDate()
  } else {
    if (count && count > 0) {
      opts.count = +count
    }
  }

  return new RRule(opts)
}
