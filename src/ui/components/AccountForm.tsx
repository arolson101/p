import * as PropTypes from 'prop-types'
import { PageHeader, InputGroup, Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { Account } from '../../docs/index'
import { Validator2 } from '../../util/index'
import { AppState } from '../../state/index'
import { formMaker, SubmitHandler, ChangeCallback } from './forms/createForm'
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

interface FormProps {
  type?: Account.Type
}

type AllProps = FormProps & Props & IntlProps

export interface Values {
  color: string
  name: string
  number: string
  type: Account.Type
  bankid: string
  key: string
}

const { Form, Text, Select, ColorAddon, formValueSelector } = formMaker<Values>('AccountForm')

const enhance = compose<AllProps, Props>(
  setDisplayName('AccountForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: PropTypes.object,
    accounts: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  withProps<{}, Props & IntlProps>((props) => ({
    initialValues: ({
      color: Account.generateColor(),
    }),
    onSubmit: async (values: Values, dispatch: any) => {
      const { onSubmit, intl: { formatMessage } } = props
      const v = new Validator2(values, formatMessage)
      v.required('name', 'number', 'type')
      v.maybeThrowSubmissionError()
      return onSubmit(values, dispatch, props)
    },
    validate: ((values: Values) => {
      const { edit, accounts, intl: { formatMessage } } = props
      const v = new Validator2(values, formatMessage)
      const otherAccounts = accounts.filter(acct => !edit || edit._id !== acct.doc._id)
      const otherNames = otherAccounts.map(acct => acct.doc.name)
      const otherNumbers = otherAccounts.filter(acct => acct.doc.type === v.values.type).map(acct => acct.doc.number)
      v.unique('name', otherNames, messages.uniqueName)
      v.unique('number', otherNumbers, messages.uniqueNumber)
      return v.errors
    }) as any
  })),
  connect<FormProps, {}, Props & IntlProps>(
    (state: AppState): FormProps => ({
      type: formValueSelector(state, 'type')
    })
  )
)

export const AccountForm = enhance((props) => {
  const { edit, type, onSubmit, onCancel } = props
  const { formatMessage } = props.intl
  const title = edit ? messages.editTitle : messages.createTitle
  return (
    <Form onSubmit={onSubmit} validate={(props as any).validate} initialValues={(props as any).initialValues}>
      <PageHeader>
        <FormattedMessage {...title}/>
      </PageHeader>

      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
        <Text
          name='name'
          label={messages.name}
          addonBefore={<ColorAddon name='color'/>}
          autoFocus
        />
        <Select
          name='type'
          options={typeOptions}
          clearable={false}
          optionRenderer={accountTypeRenderer}
          valueRenderer={accountTypeRenderer}
          label={messages.type}
        />
        <Text
          name='number'
          label={messages.number}
        />
        {(type === Account.Type.CHECKING || type === Account.Type.SAVINGS) &&
          <Text
            name='bankid'
            label={messages.bankid}
          />
        }
        {(type === Account.Type.CREDITCARD) &&
          <Text
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
