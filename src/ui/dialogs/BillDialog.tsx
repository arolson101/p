import * as moment from 'moment'
import * as numeral from 'numeral'
import * as PropTypes from 'prop-types'
import * as R from 'ramda'
import * as React from 'react'
import * as RRule from 'rrule-alt'
import * as Rx from 'rxjs/Rx'
import { Modal, DropdownButton, MenuItem, SelectCallback,
         InputGroup, PageHeader, ButtonToolbar, Button, Alert } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withPropsOnChange, withState } from 'recompose'
import { Dispatch } from 'redux'
import { saveBill, toRRule, RRuleErrorMessage } from 'core/actions'
import { Account, Budget, Bill } from 'core/docs'
import { selectBills, selectBudgets } from 'core/selectors'
import { AppState, mapDispatchToProps, setDialog } from 'core/state'
import { Validator } from 'util/index'
import { typedFields, forms, SelectOption } from '../components/forms'
import { ContainedModal } from './ContainedModal'

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

interface Params {
  edit?: Bill.View
}

interface Props extends Params {
  onHide: () => void
}

interface StateProps {
  monthOptions: SelectOption[]
  weekdayOptions: SelectOption[]
  bills: Bill.View[]
  budgets: Budget.View[]
}

interface DispatchProps {
  saveBill: saveBill.Fcn
}

interface ConnectedFormProps {
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

type ConnectedProps = StateProps & DispatchProps & Props
type EnhancedProps = State
  & ConnectedFormProps
  & ConnectedProps
  & IntlProps

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
  account?: Account.DocId
  category: string
  favicon?: string
  showAdvanced?: boolean
}

export const BillDialogStatic = {
  dialog: 'BillDialog'
}

export const showBillDialog = (params: Params) => setDialog(BillDialogStatic.dialog, params)

const form = 'BillDialog'

const enhance = compose<EnhancedProps, ConnectedProps>(
  setDisplayName(form),
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    onHide: PropTypes.func.isRequired
  }),
  injectIntl,
  withState('groups', 'setGroups', (props: ConnectedProps): SelectOption[] => getGroupNames(props.bills)),
)

const { Form2, TextField2, UrlField2, SelectField2, DateField2, CollapseField2,
  CheckboxField2, AccountField2, BudgetField2 } = typedFields<Values>()

export namespace BillDialogComponent {
  export type Props = ConnectedProps
}
export const BillDialogComponent = enhance((props) => {
  const { edit, groups, monthOptions, weekdayOptions,
    frequency, interval, end, onHide } = props
  const { formatMessage, formatNumber } = props.intl
  const title = edit ? messages.editTitle : messages.createTitle

  const endDate = moment().add(2, 'year')
  const maxGenerated = 200

  let defaultValues: Partial<Values>
  if (edit) {
    const rrule = edit.rrule
    defaultValues = {
      ...edit.doc as any,
      amount: formatNumber(edit.doc.amount, {style: 'currency', currency: 'USD'}),
      start: moment(rrule.options.dtstart).format('L'),
    }

    const opts = rrule.origOptions
    if (opts.freq === RRule.MONTHLY) {
      defaultValues.frequency = 'months'
    } else if (opts.freq === RRule.WEEKLY) {
      defaultValues.frequency = 'weeks'
    } else if (opts.freq === RRule.MONTHLY) {
      defaultValues.frequency = 'months'
    } else if (opts.freq === RRule.YEARLY) {
      defaultValues.frequency = 'years'
    }

    if (opts.interval) {
      defaultValues.interval = opts.interval
    }
    if (Array.isArray(opts.byweekday)) {
      defaultValues.byweekday = opts.byweekday.map((str: RRule.WeekdayStr) => dayMap[str]).join(',')
      defaultValues.showAdvanced = true
    }
    if (Array.isArray(opts.bymonth)) {
      defaultValues.bymonth = opts.bymonth.join(',')
      defaultValues.showAdvanced = true
    }

    defaultValues.end = 'endCount'
    if (opts.until) {
      defaultValues.until = moment(opts.until).format('L')
      defaultValues.count = 0
      defaultValues.end = 'endDate'
    } else if (typeof opts.count === 'number') {
      defaultValues.count = opts.count
      defaultValues.until = ''
    }
  } else {
    defaultValues = {
      start: moment().format('L'),
      frequency: 'months',
      interval: 1,
      end: 'endCount'
    }
  }

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...title}/>
        </Modal.Title>
      </Modal.Header>

      <Form2
        horizontal
        defaultValues={defaultValues}
        validate={(values) => {
          const v = new Validator(values, props.intl.formatMessage)
          const { edit, bills, intl: { formatMessage } } = props
          const otherBills = bills.filter((otherBill: Bill.View) => !edit || otherBill.doc._id !== edit.doc._id)
          const otherNames = otherBills.map((acct) => acct.doc.name)
          v.unique('name', otherNames, messages.uniqueName)
          v.date('start')
          v.date('until')
          v.numeral('amount')
          return v.errors
        }}
        onSubmit={async (values, state, api, instance) => {
          const { edit, onHide, saveBill, intl: { formatMessage } } = props
          const v = new Validator(values, formatMessage)
          v.required('name')
          if (v.hasErrors) {
            state.errors = v.errors
            instance.setAllTouched()
            return
          }

          await saveBill({edit: edit && edit.doc, formatMessage, values})
          return onHide()
        }}
      >
        {api => {
          const { start, interval, count, frequency, end } = api.values
          console.assert(end)
          const rrule = rruleSelector(api.values)
          const generatedValues = rrule ? rrule.all((date, index) => endDate.isAfter(date) && index < maxGenerated) : []
          const text = rrule ? rrule.toText() : ''

          const onFrequencyChange: SelectCallback = (eventKey: any) => {
            api.setValue('frequency', eventKey as Frequency)
          }
          const onEndTypeChange: SelectCallback = (eventKey: any) => {
            api.setValue('end', eventKey as EndType)
          }
          const filterEndDate = (date: Date): boolean => {
            if (start) {
              return moment(start, 'L').isBefore(date)
            }
            return false
          }

          return <div>
            <Modal.Body>
              <TextField2
                autoFocus
                name='name'
                label={messages.name}
              />
              <SelectField2
                createable
                name='group'
                options={groups}
                label={messages.group}
                promptTextCreator={(label: string) => 'create group ' + label}
                placeholder=''
              />
              <UrlField2
                name='web'
                favicoName='favicon'
                label={messages.web}
              />
              <TextField2
                name='notes'
                label={messages.notes}
              />

              <hr/>
              <TextField2
                name='amount'
                label={messages.amount}
              />
              <AccountField2
                name='account'
                label={messages.account}
              />
              <BudgetField2
                name='category'
                label={messages.budget}
              />

              <hr/>
              <p><em><FormattedMessage {...messages.frequencyHeader} values={{rule: text}}/></em></p>
              <DateField2
                name='start'
                label={messages.start}
                highlightDates={generatedValues}
              />
              {end !== 'endDate' &&
                <TextField2
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
                <DateField2
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
              <TextField2
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

              <CheckboxField2 name='showAdvanced' label={messages.advanced} message={messages.advancedMessage}/>
              <CollapseField2 name='showAdvanced'>
                <div>
                  <SelectField2
                    name='byweekday'
                    label={messages.byweekday}
                    multi
                    joinValues
                    delimiter=','
                    simpleValue
                    options={weekdayOptions}
                  />

                  <SelectField2
                    name='bymonth'
                    label={messages.bymonth}
                    multi
                    joinValues
                    delimiter=','
                    simpleValue
                    options={monthOptions}
                  />
                </div>
              </CollapseField2>

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
          </div>
        }}
      </Form2>
    </div>
  )
})

export const BillDialog = connect<StateProps, DispatchProps, Props>(
  (state: AppState): StateProps => ({
    bills: selectBills(state),
    budgets: selectBudgets(state),
    monthOptions: monthOptions(state),
    weekdayOptions: weekdayOptions(state),
  }),
  mapDispatchToProps<DispatchProps>({ saveBill })
)(BillDialogComponent)

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

const rruleSelector = (values: Values): RRule | undefined => {
  const { frequency, start, end, until, count, interval, byweekday, bymonth } = values
  const rrule = toRRule({frequency, start, end, until, count, interval, byweekday, bymonth})
  if (rrule instanceof RRuleErrorMessage) {
    return undefined
  }
  return rrule
}
