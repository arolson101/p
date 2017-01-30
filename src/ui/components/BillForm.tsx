import * as moment from 'moment'
import * as numeral from 'numeral'
import * as R from 'ramda'
import * as React from 'react'
import { Row, Col, DropdownButton, MenuItem, SelectCallback, InputGroup, ButtonToolbar, Button, Alert } from 'react-bootstrap'
import * as DatePicker from 'react-datepicker'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps, withState, withHandlers } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmitFunction, formValueSelector } from 'redux-form'
import * as RRule from 'rrule-alt'
import { Bank, Bill } from '../../docs'
import { AppState } from '../../state'
import { Validator } from '../../util'
import { withPropChangeCallback } from '../enhancers'
import { typedFields, forms, SelectOption } from './forms'
import { IntlProps } from './props'

export { SubmitFunction }

const messages = defineMessages({
  group: {
    id: 'BillForm.group',
    defaultMessage: 'Group'
  },
  name: {
    id: 'BillForm.name',
    defaultMessage: 'Name'
  },
  start: {
    id: 'BillForm.start',
    defaultMessage: 'Start'
  },
  notes: {
    id: 'BillForm.notes',
    defaultMessage: 'Notes'
  },
  web: {
    id: 'BillForm.web',
    defaultMessage: 'Website'
  },
  amount: {
    id: 'BillForm.amount',
    defaultMessage: 'Amount'
  },
  account: {
    id: 'BillForm.account',
    defaultMessage: 'Account'
  },
  uniqueName: {
    id: 'BillForm.uniqueName',
    defaultMessage: 'This name is already used'
  },
  every: {
    id: 'BillForm.every',
    defaultMessage: 'Every'
  },
  days: {
    id: 'BillForm.days',
    defaultMessage: `{interval, plural,
      one {day}
      other {days}
    }`
  },
  interval: {
    id: 'BillForm.interval',
    defaultMessage: 'Interval'
  },
  weeks: {
    id: 'BillForm.weeks',
    defaultMessage: `{interval, plural,
      one {week}
      other {weeks}
    }`
  },
  months: {
    id: 'BillForm.months',
    defaultMessage: `{interval, plural,
      one {month}
      other {months}
    }`
  },
  years: {
    id: 'BillForm.years',
    defaultMessage: `{interval, plural,
      one {year}
      other {years}
    }`
  },
  end: {
    id: 'BillForm.end',
    defaultMessage: 'End'
  },
  byweekday: {
    id: 'BillForm.byweekday',
    defaultMessage: 'Days of week'
  },
  bymonth: {
    id: 'BillForm.bymonth',
    defaultMessage: 'Months'
  },
  endCount: {
    id: 'BillForm.endCount',
    defaultMessage: 'After'
  },
  endDate: {
    id: 'BillForm.endDate',
    defaultMessage: 'By date'
  },
  endDatePlaceholder: {
    id: 'BillForm.endDatePlaceholder',
    defaultMessage: 'End date'
  },
  times: {
    id: 'BillForm.times',
    defaultMessage: 'times'
  },
  startExcluded: {
    id: 'BillForm.startExcluded',
    defaultMessage: 'Note: The specified start date does not fit in the specified rules'
  },
})

interface Props {
  edit?: Bill.View
  onSubmit: SubmitFunction<Bill.Doc>
  onCancel: () => void
}

interface ConnectedProps {
  lang: string
  accountOptions: SelectOption[]
  monthOptions: SelectOption[]
  weekdayOptions: SelectOption[]
  bills: Bill.View[]
}

interface FormProps {
  start: Date
  interval: number
  count: number
  frequency: Frequency
  end: EndType
  rrule?: RRule
}

interface State {
  groups: SelectOption[]
  setGroups: (groups: SelectOption[]) => void
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => void
  onFrequencyChange: SelectCallback
  onEndTypeChange: SelectCallback
  onCalendarChange: (date?: any, e?: any) => void
  filterEndDate: (date: Date) => boolean
}

type AllProps = Props & State & EnhancedProps & ConnectedProps & FormProps & IntlProps & ReduxFormProps<Values>

type Frequency = 'days' | 'weeks' | 'months' | 'years'
type EndType = 'endDate' | 'endCount'

interface RRuleValues {
  frequency: Frequency
  start: string
  end: EndType
  until: string
  count: number
  interval: number
  byweekday: string
  bymonth: string
}

interface Values extends RRuleValues {
  name: string
  group: string
  web: string
  notes: string
  amount: string
  account: string
}

const formName = 'BillForm'
const formSelector = formValueSelector<Values>(formName)

const enhance = compose<AllProps, Props>(
  setDisplayName(formName),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang,
      bills: state.db.current!.view.bills,
      accountOptions: accountOptions(state),
      monthOptions: monthOptions(state),
      weekdayOptions: weekdayOptions(state),
    })
  ),
  reduxForm<AllProps, Values>({
    form: formName,
    validate: (values: Values, props: AllProps) => {
      const v = new Validator(values)
      const { edit, bills, intl: { formatMessage } } = props
      const otherAccounts = bills.filter(otherBill => !edit || otherBill.doc._id !== edit.doc._id)
      const otherNames = otherAccounts.map(acct => acct.doc.name)
      v.unique('name', otherNames, formatMessage(messages.uniqueName))
      v.date('start', formatMessage(forms.date))
      v.date('until', formatMessage(forms.date))
      v.numeral('amount', formatMessage(forms.number))
      return v.errors
    },
    initialValues: {
      start: moment().format('L'),
      frequency: 'months',
      interval: 1,
      end: 'endCount'
    }
  }),
  connect(
    (state: AppState): FormProps => ({
      start: formSelector(state, 'start'),
      interval: formSelector(state, 'interval'),
      count: formSelector(state, 'count'),
      frequency: formSelector(state, 'frequency'),
      end: formSelector(state, 'end'),
      rrule: rruleSelector(state)
    })
  ),
  withState('groups', 'setGroups', (props: ConnectedProps): SelectOption[] => getGroupNames(props.bills)),
  withProps(({onSubmit, lang, edit}: AllProps): Partial<EnhancedProps> => ({
    onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
      const { intl: { formatMessage } } = props
      const v = new Validator(values)
      v.required(['group', 'name', 'start'], formatMessage(forms.required))

      const rrule = toRRule(values)
      if (rrule instanceof ErrorMessage) {
        v.errors[rrule.field] = formatMessage(rrule.message)
      }

      v.maybeThrowSubmissionError()

      const { amount, frequency, start, end, until, count, interval, byweekday, bymonth, ...rest } = values

      const bill: Bill = {
        ...edit,
        ...rest,
        amount: numeral(amount).value(),
        rruleString: rrule.toString()
      }
      const doc = Bill.doc(bill, lang)
      return onSubmit(doc, dispatch, props)
    }
  })),
  withPropChangeCallback('edit', (props: AllProps) => {
    const { edit, initialize, reset, intl: { formatNumber } } = props
    if (edit) {
      const rrule = edit.rrule
      const values: Values = {
        ...edit,
        start: moment(rrule.options.dtstart).format('L'),
      } as any

      values.amount = formatNumber(edit.doc.amount, {style: 'currency', currency: 'USD'})

      const opts = rrule.origOptions
      if (opts.freq === RRule.MONTHLY) {
        values.frequency = 'months'
      } else if (opts.freq === RRule.WEEKLY) {
        values.frequency = 'weeks'
      } else if (opts.freq === RRule.MONTHLY) {
        values.frequency = 'months'
      } else if (opts.freq === RRule.YEARLY) {
        values.frequency = 'years'
      }

      if (opts.interval) {
        values.interval = opts.interval
      }
      if (Array.isArray(opts.byweekday)) {
        values.byweekday = opts.byweekday.map((str: RRule.WeekdayStr) => dayMap[str]).join(',')
      }
      if (Array.isArray(opts.bymonth)) {
        values.bymonth = opts.bymonth.join(',')
      }

      values.end = 'endCount'
      if (opts.until) {
        values.until = moment(opts.until).format('L')
        values.count = 0
        values.end = 'endDate'
      } else if (typeof opts.count === 'number') {
        values.count = opts.count
        values.until = ''
      }

      initialize(values, false)
      reset()
    }
  }),
  withHandlers({
    onFrequencyChange: ({change}: AllProps) => (eventKey: Frequency) => {
      change('frequency', eventKey)
    },
    onEndTypeChange: ({change}: AllProps) => (eventKey: EndType) => {
      change('end', eventKey)
    },
    onCalendarChange: ({change}: AllProps) => (date?: any, e?: any) => {
      change('start', moment(date).format('L'))
    },
    filterEndDate: ({start}: AllProps) => (date: Date): boolean => {
      if (start) {
        return moment(start).isBefore(date)
      }
      return false
    }
  })
)

const { TextField, DateField, SelectField, SelectCreateableField } = typedFields<Values>()

export const BillForm = enhance((props) => {
  const { edit, onSubmit, onCancel, groups, accountOptions, monthOptions, weekdayOptions, handleSubmit, frequency,
    interval, end, filterEndDate, onFrequencyChange, onEndTypeChange, rrule, onCalendarChange } = props
  const { formatMessage } = props.intl

  const endDate = moment().add(2, 'year')
  const maxGenerated = 200
  const generatedValues = rrule ? rrule.all((date, index) => endDate.isAfter(date) && index < maxGenerated) : []
  const text = rrule ? rrule.toText() : ''

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col xs={6}>
          <TextField
            name='name'
            autoFocus
            label={formatMessage(messages.name)}
          />
        </Col>
        <Col xs={6}>
          <SelectCreateableField
            name='group'
            options={groups}
            label={formatMessage(messages.group)}
            promptTextCreator={(label) => 'create group ' + label}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <TextField
            name='notes'
            label={formatMessage(messages.notes)}
          />
        </Col>
        <Col xs={6}>
          <TextField
            name='web'
            label={formatMessage(messages.web)}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={6}>
          <TextField
            name='amount'
            label={formatMessage(messages.amount)}
          />
        </Col>
        <Col xs={6}>
          <SelectField
            name='account'
            label={formatMessage(messages.account)}
            options={accountOptions}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={6}>
          <div>
            <DateField
              name='start'
              label={formatMessage(messages.start)}
            />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          {end !== 'endDate' &&
            <TextField
              name='count'
              type='number'
              min={0}
              label={formatMessage(messages.end)}
              addonBefore={
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id='count-addon-end'
                  title={formatMessage(messages[end])}
                >
                  {['endCount', 'endDate'].map((et: EndType) =>
                    <MenuItem key={et} eventKey={et} onSelect={onEndTypeChange} active={end === et}>
                      <FormattedMessage {...messages[et]} values={{interval}}/>
                    </MenuItem>
                  )}
                </DropdownButton>
              }
              addonAfter={
                <InputGroup.Addon>
                  <FormattedMessage {...messages.times}/>
                </InputGroup.Addon>
              }
            />
          }
          {end === 'endDate' &&
            <DateField
              name='until'
              label={formatMessage(messages.end)}
              addonBefore={
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id='count-addon-end'
                  title={formatMessage(messages[end])}
                >
                  {['endCount', 'endDate'].map((et: EndType) =>
                    <MenuItem key={et} eventKey={et} onSelect={onEndTypeChange} active={end === et}>
                      <FormattedMessage {...messages[et]} values={{interval}}/>
                    </MenuItem>
                  )}
                </DropdownButton>
              }
              placeholderText={formatMessage(messages.endDatePlaceholder)}
              filterDate={filterEndDate}
            />
          }
        </Col>
      </Row>
      <Row>
        <Col xs={12} key='interval'>
          <div>
            <TextField
              name='interval'
              label={formatMessage(messages.interval)}
              type='number'
              min={0}
              addonBefore={
                <InputGroup.Addon>
                  <FormattedMessage {...messages.every}/>
                </InputGroup.Addon>
              }
              addonAfter={
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id='interval-addon-frequency'
                  title={formatMessage(messages[frequency], {interval})}
                >
                  {['days', 'weeks', 'months', 'years'].map((cf: Frequency) =>
                    <MenuItem key={cf} eventKey={cf} onSelect={onFrequencyChange} active={frequency === cf}>
                      <FormattedMessage {...messages[cf]} values={{interval}}/>
                    </MenuItem>
                  )}
                </DropdownButton>
              }
            />
          </div>
        </Col>

        <Col sm={6} xs={12} key='byweekday'>
          <div>
            <SelectField
              name='byweekday'
              label={formatMessage(messages.byweekday)}
              multi
              joinValues
              delimiter=','
              simpleValue
              options={weekdayOptions}
            />
          </div>
        </Col>

        <Col sm={6} xs={12} key='bymonth'>
          <div>
            <SelectField
              name='bymonth'
              label={formatMessage(messages.bymonth)}
              multi
              joinValues
              delimiter=','
              simpleValue
              options={monthOptions}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <em>{text}</em>
          {/*__DEVELOPMENT__ &&
            <div>{rrule ? rrule.toString() : ''}</div>
          */}
          {rrule && generatedValues.length > 0 && !moment(rrule.origOptions.dtstart).isSame(generatedValues[0]) &&
            <Alert bsStyle='danger'>
              <FormattedMessage {...messages.startExcluded}/>
            </Alert>
          }
          <div>
            <DatePicker
              utcOffset={moment().utcOffset()}
              inline
              onChange={onCalendarChange}
              selected={moment(generatedValues.length > 0 ? generatedValues[0] : new Date())}
              highlightDates={generatedValues}
              monthsShown={4}
            />
          </div>
        </Col>
      </Row>

      <ButtonToolbar className='pull-right'>
        <Button
          type='button'
          onClick={onCancel}
        >
          <FormattedMessage {...forms.cancel}/>
        </Button>
        <Button
          type='submit'
          bsStyle='primary'
        >
          {edit ? (
            <FormattedMessage {...forms.save}/>
          ) : (
            <FormattedMessage {...forms.create}/>
          )}
        </Button>
      </ButtonToolbar>
    </form>
  )
})

const dayMap = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6
} as { [key: string]: number }

const accountOptions = createSelector(
  (state: AppState) => state.db.current!.view.banks,
  (banks: Bank.View[]): SelectOption[] => {
    const accounts = R.flatten(banks.map(bank => bank.accounts))
    return accounts.map(acct => ({
      value: acct.doc._id,
      label: acct.doc.name
    }))
  }
)

const weekdayOptions = createSelector(
  (state: AppState) => state.i18n.locale,
  (locale: string): SelectOption[] => {
    const localeData = moment.localeData(locale)
    const names = localeData.weekdaysShort() // Sunday = 0
    const first = localeData.firstDayOfWeek()
    const values = R.range(first, first + 7).map((i: number) => i % 7)
    return values.map(i => ({
      value: i.toString(),
      label: names[i]
    }))
  }
)

const monthOptions = createSelector(
  (state: AppState) => state.i18n.locale,
  (locale: string): SelectOption[] => {
    const localeData = moment.localeData(locale)
    const names = localeData.monthsShort()
    const values = R.range(0, 12)
    return values.map(i => ({
      value: (i + 1).toString(), // Jan = 1
      label: names[i]
    }))
  }
)

const getGroupNames = R.pipe(
  R.map((bill: Bill.View): string => bill.doc.group),
  R.sortBy(R.toLower),
  R.uniq,
  R.map((name: string): SelectOption => ({ label: name, value: name }))
)

const rruleSelector = createSelector(
  (state: AppState) => formSelector(state, 'frequency') as Frequency,
  (state: AppState) => formSelector(state, 'start') as string,
  (state: AppState) => formSelector(state, 'end') as EndType,
  (state: AppState) => formSelector(state, 'until') as string,
  (state: AppState) => formSelector(state, 'count') as number,
  (state: AppState) => formSelector(state, 'interval') as number,
  (state: AppState) => formSelector(state, 'byweekday') as string,
  (state: AppState) => formSelector(state, 'bymonth') as string,
  (frequency, start, end, until, count, interval, byweekday, bymonth): RRule | undefined => {
    const rrule = toRRule({frequency, start, end, until, count, interval, byweekday, bymonth})
    if (rrule instanceof ErrorMessage) {
      return undefined
    }
    return rrule
  }
)

class ErrorMessage {
  field: keyof Values
  message: FormattedMessage.MessageDescriptor

  constructor(field: keyof Values, formattedMessage: FormattedMessage.MessageDescriptor) {
    this.field = field
    this.message = formattedMessage
  }
}

const toRRuleFreq = {
  days: RRule.DAILY,
  weeks: RRule.WEEKLY,
  months: RRule.MONTHLY,
  years: RRule.YEARLY
} as { [f: string]: RRule.Frequency }

const rruleDays = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA]

const toRRule = ({frequency, start, end, until, count, interval, byweekday, bymonth}: RRuleValues): RRule | ErrorMessage => {
  const date = moment(start, 'L')
  if (!date.isValid()) {
    return new ErrorMessage('start', forms.required)
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
      return new ErrorMessage('until', forms.required)
    }
    opts.until = untilDate.toDate()
  } else {
    if (count > 0) {
      opts.count = +count
    }
  }

  return new RRule(opts)
}
