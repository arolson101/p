import * as moment from 'moment'
import * as numeral from 'numeral'
import * as PropTypes from 'prop-types'
import * as R from 'ramda'
import * as React from 'react'
import * as Rx from 'rxjs/Rx'
import { Modal, DropdownButton, MenuItem, SelectCallback,
         InputGroup, PageHeader, ButtonToolbar, Button, Alert } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers, withPropsOnChange, getContext } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, formValueSelector, FormProps, SubmitHandler } from 'redux-form'
import ui, { ReduxUIProps } from 'redux-ui'
import * as RRule from 'rrule-alt'
import { Account, Budget, Bill } from '../../docs/index'
import { AppState, mapDispatchToProps, pushChanges } from '../../state/index'
import { Validator } from '../../util/index'
import { AppContentContext, AppContentContextTypes } from './AppContent'
import { typedFields, forms, SelectOption } from './forms/index'
import { IconPicker } from './forms/IconPicker'
import { IntlProps } from './props'

export { SubmitHandler }

const messages = defineMessages({
  editTitle: {
    id: 'BillDialog.editTitle',
    defaultMessage: 'Edit Bill'
  },
  createTitle: {
    id: 'BillDialog.createTitle',
    defaultMessage: 'New Bill'
  },
  group: {
    id: 'BillDialog.group',
    defaultMessage: 'Group'
  },
  infoHeader: {
    id: 'BillDialog.infoHeader',
    defaultMessage: 'Info'
  },
  name: {
    id: 'BillDialog.name',
    defaultMessage: 'Name'
  },
  start: {
    id: 'BillDialog.start',
    defaultMessage: 'Start'
  },
  notes: {
    id: 'BillDialog.notes',
    defaultMessage: 'Notes'
  },
  web: {
    id: 'BillDialog.web',
    defaultMessage: 'Website'
  },
  amountHeader: {
    id: 'BillDialog.amountHeader',
    defaultMessage: 'Amount'
  },
  amount: {
    id: 'BillDialog.amount',
    defaultMessage: 'Amount'
  },
  account: {
    id: 'BillDialog.account',
    defaultMessage: 'Account'
  },
  budget: {
    id: 'BillDialog.budget',
    defaultMessage: 'Budget'
  },
  uniqueName: {
    id: 'BillDialog.uniqueName',
    defaultMessage: 'This name is already used'
  },
  advanced: {
    id: 'BillDialog.advanced',
    defaultMessage: 'Advanced'
  },
  advancedMessage: {
    id: 'BillDialog.advancedMessage',
    defaultMessage: 'Advanced options'
  },
  frequencyHeader: {
    id: 'BillDialog.frequencyHeader',
    defaultMessage: 'Frequency: {rule}'
  },
  every: {
    id: 'BillDialog.every',
    defaultMessage: 'Every'
  },
  days: {
    id: 'BillDialog.days',
    defaultMessage: `{interval, plural,
      one {day}
      other {days}
    }`
  },
  interval: {
    id: 'BillDialog.interval',
    defaultMessage: 'Interval'
  },
  weeks: {
    id: 'BillDialog.weeks',
    defaultMessage: `{interval, plural,
      one {week}
      other {weeks}
    }`
  },
  months: {
    id: 'BillDialog.months',
    defaultMessage: `{interval, plural,
      one {month}
      other {months}
    }`
  },
  years: {
    id: 'BillDialog.years',
    defaultMessage: `{interval, plural,
      one {year}
      other {years}
    }`
  },
  end: {
    id: 'BillDialog.end',
    defaultMessage: 'End'
  },
  byweekday: {
    id: 'BillDialog.byweekday',
    defaultMessage: 'Days of week'
  },
  bymonth: {
    id: 'BillDialog.bymonth',
    defaultMessage: 'Months'
  },
  endCount: {
    id: 'BillDialog.endCount',
    defaultMessage: 'After'
  },
  endDate: {
    id: 'BillDialog.endDate',
    defaultMessage: 'By date'
  },
  endDatePlaceholder: {
    id: 'BillDialog.endDatePlaceholder',
    defaultMessage: 'End date'
  },
  times: {
    id: 'BillDialog.times',
    defaultMessage: 'times'
  },
  startExcluded: {
    id: 'BillDialog.startExcluded',
    defaultMessage: 'Note: The specified start date does not fit in the specified rules'
  },
})

interface Props {
  show: boolean
  onHide: () => void
  edit?: Bill.View
}

interface StateProps {
  lang: string
  monthOptions: SelectOption[]
  weekdayOptions: SelectOption[]
  bills: Bill.View[]
  budgets: Budget.View[]
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

type ConnectedProps = StateProps & DispatchProps

interface ConnectedFormProps {
  start: Date
  interval: number
  count: number
  frequency: Frequency
  end: EndType
  rrule?: RRule
}

interface UIState {
  groups: SelectOption[]
}

interface Handlers {
  onFrequencyChange: SelectCallback
  onEndTypeChange: SelectCallback
  filterEndDate: (date: Date) => boolean
}

type EnhancedProps = Handlers
  & ReduxUIProps<UIState>
  & ConnectedFormProps
  & FormValues
  & ConnectedProps
  & IntlProps
  & Props
  & AppContentContext

type Frequency = 'days' | 'weeks' | 'months' | 'years'
type EndType = 'endDate' | 'endCount'

interface RRuleValues {
  frequency: Frequency
  start?: string
  end?: EndType
  until?: string
  count?: number
  interval?: number
  byweekday?: string
  bymonth?: string
}

interface Values extends RRuleValues {
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

type FormValues = FormProps<Values, {}, {}>

const form = 'BillDialog'
const valueSelector = formValueSelector(form)

const enhance = compose<EnhancedProps, Props>(
  setDisplayName(form),
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  }),
  injectIntl,
  getContext<AppContentContext, Props>(
    AppContentContextTypes
  ),
  withPropsOnChange<any, IntlProps & Props>(
    ['edit', 'intl'],
    ({edit, intl: { formatNumber }}) => {
      if (edit) {
        const rrule = edit.rrule
        const initialValues: Values = {
          ...edit.doc,
          amount: formatNumber(edit.doc.amount, {style: 'currency', currency: 'USD'}),
          start: moment(rrule.options.dtstart).format('L'),
        } as any

        const opts = rrule.origOptions
        if (opts.freq === RRule.MONTHLY) {
          initialValues.frequency = 'months'
        } else if (opts.freq === RRule.WEEKLY) {
          initialValues.frequency = 'weeks'
        } else if (opts.freq === RRule.MONTHLY) {
          initialValues.frequency = 'months'
        } else if (opts.freq === RRule.YEARLY) {
          initialValues.frequency = 'years'
        }

        if (opts.interval) {
          initialValues.interval = opts.interval
        }
        if (Array.isArray(opts.byweekday)) {
          initialValues.byweekday = opts.byweekday.map((str: RRule.WeekdayStr) => dayMap[str]).join(',')
          initialValues.showAdvanced = true
        }
        if (Array.isArray(opts.bymonth)) {
          initialValues.bymonth = opts.bymonth.join(',')
          initialValues.showAdvanced = true
        }

        initialValues.end = 'endCount'
        if (opts.until) {
          initialValues.until = moment(opts.until).format('L')
          initialValues.count = 0
          initialValues.end = 'endDate'
        } else if (typeof opts.count === 'number') {
          initialValues.count = opts.count
          initialValues.until = ''
        }

        return { initialValues }
      }
    }
  ),
  connect<StateProps, DispatchProps, IntlProps & Props>(
    (state: AppState): StateProps => ({
      lang: state.i18n.lang,
      bills: state.db.current!.view.bills,
      budgets: state.db.current!.view.budgets,
      monthOptions: monthOptions(state),
      weekdayOptions: weekdayOptions(state),
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  reduxForm<Values, ConnectedProps & DispatchProps & IntlProps & Props>({
    form,
    enableReinitialize: true,
    initialValues: {
      start: moment().format('L'),
      frequency: 'months',
      interval: 1,
      end: 'endCount'
    },
    validate: (values, props) => {
      const v = new Validator(values, props.intl.formatMessage)
      const { edit, bills, intl: { formatMessage } } = props
      const otherBills = bills.filter((otherBill: Bill.View) => !edit || otherBill.doc._id !== edit.doc._id)
      const otherNames = otherBills.map((acct) => acct.doc.name)
      v.unique('name', otherNames, messages.uniqueName)
      v.date('start')
      v.date('until')
      v.numeral('amount')
      return v.errors
    },
    onSubmit: async (values, dispatch, props) => {
      const { edit, lang, onHide, pushChanges, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      v.required('group', 'name', 'amount', 'start')

      const rrule = toRRule(values)
      if (rrule instanceof ErrorMessage) {
        v.errors[rrule.field] = formatMessage(rrule.message)
      }

      v.maybeThrowSubmissionError()

      const { amount, frequency, start, end, until, count, interval, byweekday, bymonth, category, ...rest } = values
      const docs: AnyDocument[] = []

      const bill: Bill = {
        ...(edit ? edit.doc : {}),
        ...rest,
        amount: numeral(amount).value(),
        category: Budget.maybeCreateCategory(category, props.budgets, lang, docs),
        rruleString: rrule.toString()
      }
      const doc = Bill.doc(bill, lang)
      docs.push(doc)
      await pushChanges({docs})
      return onHide()
    }
  }),
  connect<ConnectedFormProps, {}, FormValues & ConnectedProps & DispatchProps & IntlProps & Props>(
    (state: AppState, props): ConnectedFormProps => ({
      start: valueSelector(state, 'start'),
      interval: valueSelector(state, 'interval'),
      count: valueSelector(state, 'count'),
      frequency: valueSelector(state, 'frequency'),
      end: valueSelector(state, 'end'),
      rrule: rruleSelector(state),
    })
  ),
  ui<UIState, ConnectedFormProps & FormValues & ConnectedProps & DispatchProps & IntlProps & Props, {}>({
    state: {
      groups: (props: ConnectedProps): SelectOption[] => getGroupNames(props.bills)
    }
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & ConnectedFormProps & FormValues & ConnectedProps & DispatchProps & IntlProps & Props>({
    onFrequencyChange: ({change}) => (eventKey: Frequency) => {
      change!('frequency', eventKey)
    },
    onEndTypeChange: ({change}) => (eventKey: EndType) => {
      change!('end', eventKey)
    },
    filterEndDate: ({start}) => (date: Date): boolean => {
      if (start) {
        return moment(start, 'L').isBefore(date)
      }
      return false
    },
  })
)

const { Form, TextField, UrlField, SelectField, DateField, CollapseField,
  CheckboxField, AccountField, BudgetField } = typedFields<Values>()

export const BillDialog = enhance((props) => {
  const { edit, ui: { groups }, monthOptions, weekdayOptions, handleSubmit,
    frequency, interval, end, filterEndDate, onFrequencyChange, onEndTypeChange, rrule, container, show, onHide, reset } = props
  const { formatMessage } = props.intl
  const title = edit ? messages.editTitle : messages.createTitle

  const endDate = moment().add(2, 'year')
  const maxGenerated = 200
  const generatedValues = rrule ? rrule.all((date, index) => endDate.isAfter(date) && index < maxGenerated) : []
  const text = rrule ? rrule.toText() : ''

  return (
    <Modal
      container={container}
      show={show}
      onHide={onHide}
      onExited={reset}
      backdrop='static'
      bsSize='large'
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...title}/>
        </Modal.Title>
      </Modal.Header>

      <Form horizontal onSubmit={handleSubmit}>
        <Modal.Body>
          <TextField
            autoFocus
            name='name'
            label={messages.name}
          />
          <SelectField
            createable
            name='group'
            options={groups}
            label={messages.group}
            promptTextCreator={(label: string) => 'create group ' + label}
            placeholder=''
          />
          <UrlField
            name='web'
            favicoName='favicon'
            label={messages.web}
          />
          <TextField
            name='notes'
            label={messages.notes}
          />

          <hr/>
          <TextField
            name='amount'
            label={messages.amount}
          />
          <AccountField
            name='account'
            label={messages.account}
          />
          <BudgetField
            name='category'
            label={messages.budget}
          />

          <hr/>
          <p><em><FormattedMessage {...messages.frequencyHeader} values={{rule: text}}/></em></p>
          <DateField
            name='start'
            label={messages.start}
            highlightDates={generatedValues}
          />
          {end !== 'endDate' &&
            <TextField
              name='count'
              type='number'
              min={0}
              label={messages.end}
              addonBefore={
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id='count-addon-end'
                  title={formatMessage(messages[end])}
                >
                  {['endCount', 'endDate'].map((et: EndType) =>
                    <MenuItem key={et} eventKey={et} onSelect={onEndTypeChange} active={end === et}>
                      <FormattedMessage {...messages[et]} values={{interval: interval.toString()}}/>
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
              label={messages.end}
              addonBefore={
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id='count-addon-end'
                  title={formatMessage(messages[end])}
                >
                  {['endCount', 'endDate'].map((et: EndType) =>
                    <MenuItem key={et} eventKey={et} onSelect={onEndTypeChange} active={end === et}>
                      <FormattedMessage {...messages[et]} values={{interval: interval.toString()}}/>
                    </MenuItem>
                  )}
                </DropdownButton>
              }
              placeholderText={formatMessage(messages.endDatePlaceholder)}
              filterDate={filterEndDate}
            />
          }
          <TextField
            name='interval'
            label={messages.interval}
            type='number'
            min={0}
            addonBefore={
              <InputGroup.Addon>
                <FormattedMessage {...messages.every}/>
              </InputGroup.Addon>
            }
            addonAfter={
              <DropdownButton
                pullRight
                componentClass={InputGroup.Button}
                id='interval-addon-frequency'
                title={formatMessage(messages[frequency], {interval: interval.toString()})}
              >
                {['days', 'weeks', 'months', 'years'].map((cf: Frequency) =>
                  <MenuItem key={cf} eventKey={cf} onSelect={onFrequencyChange} active={frequency === cf}>
                    <FormattedMessage {...messages[cf]} values={{interval: interval.toString()}}/>
                  </MenuItem>
                )}
              </DropdownButton>
            }
          />

          <CheckboxField name='showAdvanced' label={messages.advanced} message={messages.advancedMessage}/>
          <CollapseField name='showAdvanced'>
            <div>
              <SelectField
                name='byweekday'
                label={messages.byweekday}
                multi
                joinValues
                delimiter=','
                simpleValue
                options={weekdayOptions}
              />

              <SelectField
                name='bymonth'
                label={messages.bymonth}
                multi
                joinValues
                delimiter=','
                simpleValue
                options={monthOptions}
              />
            </div>
          </CollapseField>

          {/*__DEVELOPMENT__ &&
            <div>{rrule ? rrule.toString() : ''}</div>
          */}
          {rrule && generatedValues.length > 0 && !moment(rrule.origOptions.dtstart).isSame(generatedValues[0]) &&
            <Alert bsStyle='danger'>
              <FormattedMessage {...messages.startExcluded}/>
            </Alert>
          }
        </Modal.Body>

        <Modal.Footer>
          <ButtonToolbar className='pull-right'>
            <Button
              type='button'
              onClick={onHide}
            >
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <Button
              type='submit'
              bsStyle='primary'
              id='open-dropdown'
            >
              {edit ? (
                <FormattedMessage {...forms.save}/>
              ) : (
                <FormattedMessage {...forms.create}/>
              )}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>

      </Form>
    </Modal>
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
  (state: AppState) => valueSelector(state, 'frequency') as Frequency,
  (state: AppState) => valueSelector(state, 'start') as string,
  (state: AppState) => valueSelector(state, 'end') as EndType,
  (state: AppState) => valueSelector(state, 'until') as string,
  (state: AppState) => valueSelector(state, 'count') as number,
  (state: AppState) => valueSelector(state, 'interval') as number,
  (state: AppState) => valueSelector(state, 'byweekday') as string,
  (state: AppState) => valueSelector(state, 'bymonth') as string,
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

  constructor (field: keyof Values, formattedMessage: FormattedMessage.MessageDescriptor) {
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
    if (count && count > 0) {
      opts.count = +count
    }
  }

  return new RRule(opts)
}
