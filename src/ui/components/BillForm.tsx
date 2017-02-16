import * as moment from 'moment'
import * as numeral from 'numeral'
import * as R from 'ramda'
import * as React from 'react'
import { Collapse, DropdownButton, MenuItem, SelectCallback,
         InputGroup, PageHeader, ButtonToolbar, Button, Alert } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps, withHandlers } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmitFunction, formValueSelector } from 'redux-form'
import ui, { ReduxUIProps } from 'redux-ui'
import * as RRule from 'rrule-alt'
import { getFavicon } from '../../actions'
import { Account, Budget, Bill } from '../../docs'
import { AppState, mapDispatchToProps, pushChanges } from '../../state'
import { Validator } from '../../util'
import { withPropChangeCallback } from '../enhancers'
import { typedFields, forms, SelectOption } from './forms'
import { IconPicker } from './forms/IconPicker'
import { IntlProps } from './props'

export { SubmitFunction }

const messages = defineMessages({
  group: {
    id: 'BillForm.group',
    defaultMessage: 'Group'
  },
  infoHeader: {
    id: 'BillForm.infoHeader',
    defaultMessage: 'Info'
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
  amountHeader: {
    id: 'BillForm.amountHeader',
    defaultMessage: 'Amount'
  },
  amount: {
    id: 'BillForm.amount',
    defaultMessage: 'Amount'
  },
  account: {
    id: 'BillForm.account',
    defaultMessage: 'Account'
  },
  budget: {
    id: 'BillForm.budget',
    defaultMessage: 'Budget'
  },
  uniqueName: {
    id: 'BillForm.uniqueName',
    defaultMessage: 'This name is already used'
  },
  frequencyHeader: {
    id: 'BillForm.frequencyHeader',
    defaultMessage: 'Frequency: {rule}'
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
  title: FormattedMessage.MessageDescriptor
  edit?: Bill.View
  onSubmit: SubmitFunction<Bill.Doc>
  onCancel: () => void
}

interface ConnectedProps {
  lang: string
  monthOptions: SelectOption[]
  weekdayOptions: SelectOption[]
  bills: Bill.View[]
  budgets: Budget.View[]
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface FormProps {
  start: Date
  interval: number
  count: number
  frequency: Frequency
  end: EndType
  showAdvanced: boolean
  rrule?: RRule
  web: string
  favicon: string
}

interface UIState {
  groups: SelectOption[]
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => void
}

interface Handlers {
  onFrequencyChange: SelectCallback
  onEndTypeChange: SelectCallback
  filterEndDate: (date: Date) => boolean
  changeIcon: (favicon?: string) => void
}

type AllProps = Handlers
  & EnhancedProps
  & ReduxUIProps<UIState>
  & FormProps
  & ReduxFormProps<Values>
  & ConnectedProps
  & DispatchProps
  & IntlProps
  & Props

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
  account: Account.DocId
  category: string
  favicon: string
  showAdvanced: boolean
}

const formName = 'BillForm'
const formSelector = formValueSelector<Values>(formName)

const enhance = compose<AllProps, Props>(
  setDisplayName(formName),
  onlyUpdateForPropTypes,
  setPropTypes({
    title: React.PropTypes.object.isRequired,
    edit: React.PropTypes.object,
    onCancel: React.PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps & Props>(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang,
      bills: state.db.current!.view.bills,
      budgets: state.db.current!.view.budgets,
      monthOptions: monthOptions(state),
      weekdayOptions: weekdayOptions(state),
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  reduxForm<ConnectedProps & DispatchProps & IntlProps & Props, Values>({
    form: formName,
    validate: (values: Values, props) => {
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
  connect<FormProps, {}, ReduxFormProps<Values> & ConnectedProps & DispatchProps & IntlProps & Props>(
    (state: AppState, props): FormProps => ({
      start: formSelector(state, 'start'),
      interval: formSelector(state, 'interval'),
      count: formSelector(state, 'count'),
      frequency: formSelector(state, 'frequency'),
      end: formSelector(state, 'end'),
      showAdvanced: formSelector(state, 'showAdvanced'),
      rrule: rruleSelector(state),
      web: formSelector(state, 'web'),
      favicon: formSelector(state, 'favicon'),
    })
  ),
  ui<UIState, FormProps & ReduxFormProps<Values> & ConnectedProps & DispatchProps & IntlProps & Props, {}>({
    state: {
      groups: (props: ConnectedProps): SelectOption[] => getGroupNames(props.bills)
    }
  }),
  withProps<EnhancedProps, ReduxUIProps<UIState> & FormProps & ReduxFormProps<Values> & ConnectedProps & DispatchProps & IntlProps & Props>(
    ({onSubmit, pushChanges, lang, edit}) => ({
      onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
        const { intl: { formatMessage } } = props
        const v = new Validator(values)
        v.required(['group', 'name', 'amount', 'start'], formatMessage(forms.required))

        const rrule = toRRule(values)
        if (rrule instanceof ErrorMessage) {
          v.errors[rrule.field] = formatMessage(rrule.message)
        }

        v.maybeThrowSubmissionError()

        const { amount, frequency, start, end, until, count, interval, byweekday, bymonth, category, ...rest } = values
        const docs: AnyDocument[] = []

        const bill: Bill = {
          ...(edit ? edit!.doc : {}),
          ...rest,
          amount: numeral(amount).value(),
          category: Budget.maybeCreateCategory(category, props.budgets, lang, docs),
          rruleString: rrule.toString()
        }
        const doc = Bill.doc(bill, lang)
        docs.push(doc)
        await pushChanges({docs})
        return onSubmit(doc)
      }
    })
  ),
  // tslint:disable-next-line:max-line-length
  withPropChangeCallback<EnhancedProps & ReduxUIProps<UIState> & FormProps & ReduxFormProps<Values> & ConnectedProps & DispatchProps & IntlProps & Props>(
    'edit',
    (props) => {
      const { edit, initialize, intl: { formatNumber } } = props
      if (edit) {
        const rrule = edit.rrule
        const values: Values = {
          ...edit.doc,
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
          values.showAdvanced = true
        }
        if (Array.isArray(opts.bymonth)) {
          values.bymonth = opts.bymonth.join(',')
          values.showAdvanced = true
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
      }
    }
  ),
  // tslint:disable-next-line:max-line-length
  withPropChangeCallback<EnhancedProps & ReduxUIProps<UIState> & FormProps & ReduxFormProps<Values> & ConnectedProps & DispatchProps & IntlProps & Props>(
    'web',
    // TODO: debounce
    async (props, prev) => {
      const { web, favicon, change } = props
      if (web && (favicon === undefined || prev)) { // avoid re-fetching icon
        try {
          console.log('getting favicon')
          change('favicon', '')
          const response = await getFavicon(web)
          change('favicon', response!)
        } catch (err) {
          console.log('error getting favicon: ', err.message)
        }
      }
    }
  ),
  // tslint:disable-next-line:max-line-length
  withHandlers<Handlers, EnhancedProps & ReduxUIProps<UIState> & FormProps & ReduxFormProps<Values> & ConnectedProps & DispatchProps & IntlProps & Props>({
    onFrequencyChange: ({change}) => (eventKey: Frequency) => {
      change('frequency', eventKey)
    },
    onEndTypeChange: ({change}) => (eventKey: EndType) => {
      change('end', eventKey)
    },
    filterEndDate: ({start}) => (date: Date): boolean => {
      if (start) {
        return moment(start).isBefore(date)
      }
      return false
    },
    changeIcon: ({change, web}) => async (favicon?: string) => {
      if (favicon === undefined) {
        // re-download
        change('favicon', '')
        const response = await getFavicon(web)
        change('favicon', response!)
      } else {
        change('favicon', favicon)
      }
    }
  })
)

const { TextField, DateField, SelectField, SelectCreateableField, CheckboxField, AccountField, BudgetField } = typedFields<Values>()

export const BillForm = enhance((props) => {
  const { edit, title, onSubmit, onCancel, showAdvanced, ui: { groups }, monthOptions,
    weekdayOptions, handleSubmit, frequency, interval, end, filterEndDate, onFrequencyChange, onEndTypeChange, rrule } = props
  const { formatMessage } = props.intl

  const endDate = moment().add(2, 'year')
  const maxGenerated = 200
  const generatedValues = rrule ? rrule.all((date, index) => endDate.isAfter(date) && index < maxGenerated) : []
  const text = rrule ? rrule.toText() : ''

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader>
        <FormattedMessage {...title}/>
      </PageHeader>

      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
        <TextField
          autoFocus
          name='name'
          label={formatMessage(messages.name)}
        />
        <SelectCreateableField
          name='group'
          options={groups}
          label={formatMessage(messages.group)}
          promptTextCreator={(label) => 'create group ' + label}
          placeholder=''
        />
        <TextField
          name='web'
          label={formatMessage(messages.web)}
          addonBefore={
            <InputGroup.Button>
              <IconPicker value={props.favicon} onChange={props.changeIcon}/>
            </InputGroup.Button>
          }
        />
        <TextField
          name='notes'
          label={formatMessage(messages.notes)}
        />

        <hr/>
        <TextField
          name='amount'
          label={formatMessage(messages.amount)}
        />
        <AccountField
          name='account'
          label={formatMessage(messages.account)}
        />
        <BudgetField
          name='category'
          label={formatMessage(messages.budget)}
        />

        <hr/>
        <p><em><FormattedMessage {...messages.frequencyHeader} values={{rule: text}}/></em></p>
        <DateField
          name='start'
          label={formatMessage(messages.start)}
          highlightDates={generatedValues}
        />
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
              pullRight
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

        <CheckboxField name='showAdvanced' label='advanced'/>
        <Collapse in={showAdvanced}>
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
        </Collapse>

        {/*__DEVELOPMENT__ &&
          <div>{rrule ? rrule.toString() : ''}</div>
        */}
        {rrule && generatedValues.length > 0 && !moment(rrule.origOptions.dtstart).isSame(generatedValues[0]) &&
          <Alert bsStyle='danger'>
            <FormattedMessage {...messages.startExcluded}/>
          </Alert>
        }

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
      </div>
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
    if (count > 0) {
      opts.count = +count
    }
  }

  return new RRule(opts)
}
