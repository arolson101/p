import { Col, ButtonToolbar, Button } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName } from 'recompose'
import { reduxForm, formValueSelector, ReduxFormProps, SubmitFunction } from 'redux-form'
import { Account } from '../../docs'
import { Validator } from '../../util'
import { AppState } from '../../state'
import { withPropChangeCallback } from '../enhancers'
import { typedFields, forms } from './forms'
import { IntlProps } from './props'

export { SubmitFunction }

const messages = defineMessages({
  name: {
    id: 'acForm.name',
    defaultMessage: 'Account Name'
  },
  number: {
    id: 'acForm.number',
    defaultMessage: 'Account Number'
  },
  type: {
    id: 'acForm.type',
    defaultMessage: 'Account Type'
  },
  uniqueName: {
    id: 'acForm.uniqueName',
    defaultMessage: 'This account name is already used'
  },
  uniqueNumber: {
    id: 'acForm.uniqueNumber',
    defaultMessage: 'This account number is already used'
  },
  bankid: {
    id: 'acForm.bankid',
    defaultMessage: 'Routing Number',
    description: `Bank identifier, A-9
      Use of this field by country:
      COUNTRY     Interpretation
      BEL         Bank code
      CAN         Routing and transit number
      CHE         Clearing number
      DEU         Bankleitzahl
      ESP         Entidad
      FRA         Banque
      GBR         Sort code
      ITA         ABI
      NLD         Not used (field contents ignored)
      USA         Routing and transit number`
  },
  key: {
    id: 'acForm.key',
    defaultMessage: 'Account Key (for international accounts)'
  }
})

interface Props {
  account?: Account.Doc
  accounts: Account.Doc[]
  onSubmit: SubmitFunction<Values>
  onCancel: () => void
}

interface ConnectedProps {
  type?: Account.Type
}

type AllProps = Props & ConnectedProps & IntlProps & ReduxFormProps<Values>

export interface Values {
  name: string
  number: string
  type: Account.Type
  bankid: string
  key: string
}

const { TextField, SelectField } = typedFields<Values>()
const formName = 'accountForm'
const formSelector = formValueSelector<Values>(formName)

const enhance = compose<AllProps, Props>(
  setDisplayName('AccountForm'),
  injectIntl,
  reduxForm<AllProps, Values>({
    form: formName,
    validate: (values: Values, props: AllProps) => {
      const v = new Validator(values)
      const { account, accounts, intl: { formatMessage } } = props
      const otherAccounts = accounts.filter(acct => !account || account._id !== acct._id)
      const otherNames = otherAccounts.map(acct => acct.name)
      const otherNumbers = otherAccounts.filter(acct => acct.type === v.values.type).map(acct => acct.number)
      v.required(['name', 'number', 'type'], formatMessage(forms.required))
      v.unique('name', otherNames, formatMessage(messages.uniqueName))
      v.unique('number', otherNumbers, formatMessage(messages.uniqueNumber))
      return v.errors
    }
  }),
  withPropChangeCallback('account', (props: AllProps) => {
    const { account, initialize, reset } = props
    if (account) {
      const values = account
      initialize(values, false)
      reset()
    }
  }),
  connect(
    (state: AppState): ConnectedProps => ({
      type: formSelector(state, 'type')
    })
  )
)

export const AccountForm = enhance((props) => {
  const { account, type, onSubmit, onCancel, handleSubmit } = props
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
        <SelectField
          name='type'
          options={typeOptions}
          clearable={false}
          optionRenderer={accountTypeRenderer}
          valueRenderer={accountTypeRenderer}
          label={formatMessage(messages.type)}
        />
      </Col>
      <Col>
        <TextField
          name='number'
          label={formatMessage(messages.number)}
        />
      </Col>
      {(type === Account.Type.CHECKING || type === Account.Type.SAVINGS) &&
        <Col>
          <TextField
            name='bankid'
            label={formatMessage(messages.bankid)}
          />
        </Col>
      }
      {(type === Account.Type.CREDITCARD) &&
        <Col>
          <TextField
            name='key'
            label={formatMessage(messages.key)}
          />
        </Col>
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
          {account ? (
            <FormattedMessage {...forms.save}/>
          ) : (
            <FormattedMessage {...forms.create}/>
          )}
        </Button>
      </ButtonToolbar>
    </form>
  )
})

const typeOptions = Object
  .keys(Account.Type)
  .map(type => ({
    value: type,
    label: type
  }))

const accountTypeRenderer = (option: {value: Account.Type, label: string}) =>
  <span>
    <FormattedMessage {...(Account.messages as any)[Account.Type[option.value]]}/>
  </span>
