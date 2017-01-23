import * as moment from 'moment'
import * as R from 'ramda'
import * as React from 'react'
import { Col, ButtonGroup, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps, withState } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmitFunction, formValueSelector } from 'redux-form'
import { Bill } from '../../docs'
import { AppState } from '../../state'
import { Validator, Lookup } from '../../util'
import { withPropChangeCallback } from '../enhancers'
import { typedFields, forms, SelectOption } from './forms'
import { IntlProps, FormatMessageFcn } from './props'

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
  frequency: {
    id: 'BillForm.frequency',
    defaultMessage: 'Frequency'
  },
  notes: {
    id: 'BillForm.notes',
    defaultMessage: 'Notes'
  },
  uniqueName: {
    id: 'BillForm.uniqueName',
    defaultMessage: 'This name is already used'
  },
  everyWeek: {
    id: 'BillForm.everyWeek',
    defaultMessage: 'Every Week'
  },
  everyOtherWeek: {
    id: 'BillForm.everyOtherWeek',
    defaultMessage: 'Every Other Week'
  },
  everyMonth: {
    id: 'BillForm.everyMonth',
    defaultMessage: 'Every Month'
  },
  everyYear: {
    id: 'BillForm.everyYear',
    defaultMessage: 'Every Year'
  }
})

interface Props {
  edit?: Bill.Doc
  onSubmit: SubmitFunction<Bill.Doc>
  onCancel: () => void
}

interface ConnectedProps {
  lang: string
  bills: Bill.Cache
  frequency: Bill.Frequency
}

interface State {
  groups: SelectOption[]
  setGroups: (groups: SelectOption[]) => void
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => void
}

type AllProps = Props & State & EnhancedProps & ConnectedProps & IntlProps & ReduxFormProps<Values>

interface Values {
  start: string
  frequency: Bill.Frequency
  name: string
  notes: string
  group: string
  byDay: string
  byMonthDay: string
  byMonth: string
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
  reduxForm<AllProps, Values>({
    form: formName,
    validate: (values: Values, props: AllProps) => {
      const v = new Validator(values)
      const { edit, bills, intl: { formatMessage } } = props
      const otherAccounts = Lookup.filter(bills, otherBill => !edit || otherBill._id !== edit._id)
      const otherNames = otherAccounts.map(acct => acct.name)
      v.unique('name', otherNames, formatMessage(messages.uniqueName))
      v.date('start', formatMessage(forms.date))
      return v.errors
    },
    initialValues: {
      start: moment().format('L'),
      frequency: Bill.Frequency.monthly
    }
  }),
  connect(
    (state: AppState, props: AllProps): ConnectedProps => ({
      lang: state.i18n.lang,
      bills: state.db.current!.cache.bills,
      frequency: formSelector(state, 'frequency')
    })
  ),
  withState('groups', 'setGroups', (props: ConnectedProps): SelectOption[] => getGroupNames(props.bills)),
  withProps(({onSubmit, lang, edit}: AllProps): EnhancedProps => ({
    onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
      const { intl: { formatMessage } } = props
      const v = new Validator(values)
      v.required(['group', 'name', 'start'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()

      const date = moment(values.start, 'L')
      const bill: Bill = {
        ...edit,
        ...values,
        date: {
          year: date.year(),
          month: date.month(),
          date: date.date()
        }
      }
      const doc = Bill.doc(bill, lang)
      return onSubmit(doc, dispatch, props)
    }
  })),
  withPropChangeCallback('edit', (props: AllProps) => {
    const { edit, initialize, reset } = props
    if (edit) {
      const values: Values = {
        ...edit,
        start: moment(Bill.toDate(edit.date)).format('L')
      } as any
      initialize(values, false)
      reset()
    }
  })
)

const { TextField, DateField, SelectField, SelectCreateableField, ButtonArrayField } = typedFields<Values>()

export const BillForm = enhance((props) => {
  const { edit, onSubmit, onCancel, groups, handleSubmit, frequency } = props
  const { formatMessage } = props.intl
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Col>
        <SelectCreateableField
          name='group'
          options={groups}
          label={formatMessage(messages.group)}
          // newOptionCreator={({label, labelKey, valueKey}) => ({ [labelKey]: label, [valueKey]: label})}
          promptTextCreator={(label) => 'create group ' + label}
        />
      </Col>
      <Col>
        <TextField
          name='name'
          autoFocus
          label={formatMessage(messages.name)}
        />
      </Col>
      <Col>
        <TextField
          name='notes'
          label={formatMessage(messages.notes)}
        />
      </Col>
      <Col>
          <DateField
            name='start'
            label={formatMessage(messages.start)}
          />
      </Col>
      <Col>
          <SelectField
            name='frequency'
            clearable={false}
            options={frequencyOptions(formatMessage)}
            label={formatMessage(messages.frequency)}
          />
      </Col>

      {(frequency === Bill.Frequency.daily) &&
        <div>daily</div>
      }
      {(frequency === Bill.Frequency.weekly) &&
        <div>
          <div>every [N] week(s)</div>
          <ButtonArrayField
            name='byDay'
            label='week day'
            maxPerRow={7}
            strings={daysOfWeekStr}
            values={daysOfWeekStr}
          />
        </div>
      }
      {(frequency === Bill.Frequency.monthly) &&
        <div>
          <div>every [N] month</div>
          <div>(*) on days<br/>
          <ButtonArrayField
            name='byMonthDay'
            label='month day'
            maxPerRow={7}
            buttonWidth={40}
            buttonHeight={40}
            strings={daysOfMonth}
            values={daysOfMonth}
          />

          </div>
          <div>(*) on the<br/>
            [first/second/third/fourth/fifth/last] [SMTWTFS/day/weekday/weekend day]
          </div>
        </div>
      }
      {(frequency === Bill.Frequency.yearly) &&
        <div>
          <div>Every [N] year(s)</div>
          <ButtonArrayField
            name='byMonth'
            label='month'
            maxPerRow={4}
            strings={monthsStr}
            values={months}
          />
          <div>[X] On the<br/>
            [first/second/third/fourth/fifth/last] [SMTWTFS/day/weekday/weekend day]
          </div>
        </div>
      }
      (note when dtstart isn't in set)
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

const daysOfWeek = R.range(1, 8)
const daysOfWeekStr = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
const daysOfMonth = R.range(1, 32).map(R.toString)
const months = R.range(1, 13).map(R.toString)
const monthsStr = months.map(R.toString)


const getGroupNames = R.pipe(
  (bills: Bill.Cache) => Array.from(bills.values()),
  R.map((bill: Bill.Doc): string => bill.group),
  R.sortBy(R.toLower),
  R.uniq,
  R.map((name: string): SelectOption => ({ label: name, value: name }))
)

const frequencyOptions = (formatMessage: FormatMessageFcn) =>
  R.pipe(
    R.keys,
    R.map((name: keyof typeof Bill.messages): SelectOption => ({
        label: formatMessage(Bill.messages[name]),
        value: name
      })
    )
  )(Bill.Frequency)
