import * as PropTypes from 'prop-types'
import { PageHeader, InputGroup, Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers, withPropsOnChange } from 'recompose'
import { reduxForm, formValueSelector, FormProps } from 'redux-form'
import { Account } from '../../docs/index'
import { Validator } from '../../util/index'
import { AppState } from '../../state/index'
import { typedFields, forms, SubmitHandler } from './forms/index'
import { IntlProps } from './props'

export { SubmitHandler }

const messages = defineMessages({
  createTitle: {
    id: 'AccountForm.createTitle',
    defaultMessage: 'Add Account'
  },
  editTitle: {
    id: 'AccountForm.editTitle',
    defaultMessage: 'Edit Account'
  },
  name: {
    id: 'AccountForm.name',
    defaultMessage: 'Name'
  },
  number: {
    id: 'AccountForm.number',
    defaultMessage: 'Number'
  },
  type: {
    id: 'AccountForm.type',
    defaultMessage: 'Type'
  },
  uniqueName: {
    id: 'AccountForm.uniqueName',
    defaultMessage: 'This account name is already used'
  },
  uniqueNumber: {
    id: 'AccountForm.uniqueNumber',
    defaultMessage: 'This account number is already used'
  },
  bankid: {
    id: 'AccountForm.bankid',
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
    id: 'AccountForm.key',
    defaultMessage: 'Account Key (for international accounts)'
  }
})

interface Props {
  edit?: Account.Doc
  accounts: Account.View[]
  onSubmit: SubmitHandler<Values>
  onCancel: () => void
}

interface ConnectedFormProps {
  type?: Account.Type
}

type EnhancedProps = FormProps<Values, any, any> & ConnectedFormProps & Props & IntlProps

export interface Values {
  color: string
  name: string
  number: string
  type: Account.Type
  bankid: string
  key: string
}

const form = 'AccountForm'
const { Form, TextField, SelectField, ColorAddon } = typedFields<Values>()
const valueSelector = formValueSelector(form)

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('AccountForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: PropTypes.object,
    accounts: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  withPropsOnChange<any, FormProps<Values, any, any> & Props>(
    ['edit'],
    ({ edit }) => {
      const initialValues = edit || ({
        color: Account.generateColor(),
      })
      return { initialValues }
    }
  ),
  reduxForm<Values, Props & InjectedIntlProps, AppState>({
    form,
    enableReinitialize: true,
    onSubmit: async (values, dispatch, props) => {
      const { onSubmit, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      v.required('name', 'number', 'type')
      v.maybeThrowSubmissionError()
      return onSubmit(values, dispatch, props)
    },
    validate: ((values, props) => {
      const { edit, accounts, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      const otherAccounts = accounts.filter(acct => !edit || edit._id !== acct.doc._id)
      const otherNames = otherAccounts.map(acct => acct.doc.name)
      const otherNumbers = otherAccounts.filter(acct => acct.doc.type === v.values.type).map(acct => acct.doc.number)
      v.unique('name', otherNames, messages.uniqueName)
      v.unique('number', otherNumbers, messages.uniqueNumber)
      return v.errors
    })
  }),
  connect<ConnectedFormProps, {}, Props & IntlProps>(
    (state: AppState): ConnectedFormProps => ({
      type: valueSelector(state, 'type')
    })
  )
)

export const AccountForm = enhance((props) => {
  const { edit, type, handleSubmit, onCancel } = props
  const { formatMessage } = props.intl
  const title = edit ? messages.editTitle : messages.createTitle
  return (
    <Form onSubmit={handleSubmit}>
      <PageHeader>
        <FormattedMessage {...title}/>
      </PageHeader>

      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
        <TextField
          name='name'
          label={messages.name}
          addonBefore={<ColorAddon name='color'/>}
          autoFocus
        />
        <SelectField
          name='type'
          options={typeOptions}
          clearable={false}
          optionRenderer={accountTypeRenderer}
          valueRenderer={accountTypeRenderer}
          label={messages.type}
        />
        <TextField
          name='number'
          label={messages.number}
        />
        {(type === Account.Type.CHECKING || type === Account.Type.SAVINGS) &&
          <TextField
            name='bankid'
            label={messages.bankid}
          />
        }
        {(type === Account.Type.CREDITCARD) &&
          <TextField
            name='key'
            label={messages.key}
          />
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
    </Form>
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
