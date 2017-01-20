import * as moment from 'moment'
import * as R from 'ramda'
import * as React from 'react'
import { Col, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps, withState } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmitFunction } from 'redux-form'
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
  date: {
    id: 'BillForm.date',
    defaultMessage: 'Date'
  },
  recurrence: {
    id: 'BillForm.recurrence',
    defaultMessage: 'Recurrence'
  },
  notes: {
    id: 'BillForm.notes',
    defaultMessage: 'Notes'
  },
  uniqueName: {
    id: 'BillForm.uniqueName',
    defaultMessage: 'This name is already used'
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
  date: string
  recurrence: Bill.Recurrence
  name: string
  notes: string
  group: string
}

const enhance = compose<AllProps, Props>(
  setDisplayName('BillForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  } as PropTypes<Props>),
  connect(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang,
      bills: state.db.current!.cache.bills
    })
  ),
  injectIntl,
  withState('groups', 'setGroups', (props: ConnectedProps): SelectOption[] => getGroupNames(props.bills)),
  withProps(({onSubmit, lang, edit}: AllProps): EnhancedProps => ({
    onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
      const { intl: { formatMessage } } = props
      const v = new Validator(values)
      v.required(['group', 'name', 'date'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()

      const date = moment(values.date, 'L')
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
  reduxForm<AllProps, Values>({
    form: 'BillForm',
    validate: (values: Values, props: AllProps) => {
      const v = new Validator(values)
      const { edit, bills, intl: { formatMessage } } = props
      const otherAccounts = Lookup.filter(bills, otherBill => !edit || otherBill._id !== edit._id)
      const otherNames = otherAccounts.map(acct => acct.name)
      v.unique('name', otherNames, formatMessage(messages.uniqueName))
      v.date('date', formatMessage(forms.date))
      return v.errors
    },
    initialValues: {
      date: moment().format('L')
    }
  }),
  withPropChangeCallback('edit', (props: AllProps) => {
    const { edit, initialize, reset } = props
    if (edit) {
      const values: Values = {
        ...edit,
        date: moment(Bill.toDate(edit.date)).format('L')
      } as any
      initialize(values, false)
      reset()
    }
  })
)

const { TextField, DateField, SelectField, SelectCreateableField } = typedFields<Values>()

export const BillForm = enhance((props) => {
  const { edit, onSubmit, onCancel, groups, handleSubmit } = props
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
        <DateField
          name='date'
          label={formatMessage(messages.date)}
        />
      </Col>
      <Col>
        <SelectField
          name='recurrence'
          options={recurrenceOptions(formatMessage)}
          label={formatMessage(messages.recurrence)}
        />
      </Col>
      <Col>
        <TextField
          name='notes'
          label={formatMessage(messages.notes)}
        />
      </Col>
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

const getGroupNames = R.pipe(
  (bills: Bill.Cache) => Array.from(bills.values()),
  R.map((bill: Bill.Doc): string => bill.group),
  R.sortBy(R.toLower),
  R.uniq,
  R.map((name: string): SelectOption => ({ label: name, value: name }))
)

const recurrenceOptions = (formatMessage: FormatMessageFcn) =>
  R.pipe(
    R.keys,
    R.map((name: keyof typeof Bill.messages): SelectOption => ({
        label: formatMessage(Bill.messages[name]),
        value: name
      })
    )
  )(Bill.Recurrence)
