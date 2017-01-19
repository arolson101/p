import { Col, ButtonToolbar, Button } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmitFunction } from 'redux-form'
import { Bill } from '../../docs'
import { AppState } from '../../state'
import { Validator, Lookup } from '../../util'
import { withPropChangeCallback } from '../enhancers'
import { typedFields, forms } from './forms'
import { IntlProps } from './props'

export { SubmitFunction }

const messages = defineMessages({
  name: {
    id: 'BillForm.name',
    defaultMessage: 'Name'
  },
  date: {
    id: 'BillForm.date',
    defaultMessage: 'Date'
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
  bills: Bill.Cache
  onSubmit: SubmitFunction<Values>
  onCancel: () => void
}

interface ConnectedProps {
  lang: string
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => void
}

type AllProps = Props & EnhancedProps & ConnectedProps & IntlProps & ReduxFormProps<Values>

export interface Values {
  date: Date
  name: string
  notes: string
}

const enhance = compose<AllProps, Props>(
  setDisplayName('BillForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: React.PropTypes.object,
    bills: React.PropTypes.instanceOf(Map).isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  } as PropTypes<Props>),
  connect(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang
    })
  ),
  injectIntl,
  withProps(({onSubmit}): EnhancedProps => ({
    onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
      const { intl: { formatMessage } } = props
      const v = new Validator(values)
      v.required(['name', 'date'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()
      onSubmit(values, dispatch, props)
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
      return v.errors
    }
  }),
  withPropChangeCallback('edit', (props: AllProps) => {
    const { edit, initialize, reset } = props
    if (edit) {
      initialize(edit, false)
      reset()
    }
  })
)

const { TextField, DateField } = typedFields<Values>()

export const BillForm = enhance((props) => {
  const { edit, onSubmit, onCancel, handleSubmit } = props
  const { formatMessage } = props.intl
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
