import { Modal, InputGroup, Button } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { reduxForm, formValueSelector, ReduxFormProps, SubmitFunction } from 'redux-form'
import { Account } from '../../docs'
import { Validator } from '../../util'
import { AppState } from '../../state'
import { ColorPicker } from './ColorPicker'
import { withPropChangeCallback } from '../enhancers'
import { typedFields, forms } from './forms'
import { IntlProps } from './props'

export { SubmitFunction }

const messages = defineMessages({
  name: {
    id: 'acForm.name',
    defaultMessage: 'Name'
  },
  number: {
    id: 'acForm.number',
    defaultMessage: 'Number'
  },
  type: {
    id: 'acForm.type',
    defaultMessage: 'Type'
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
  title: FormattedMessage.MessageDescriptor
  edit?: Account.Doc
  accounts: Account.View[]
  onSubmit: SubmitFunction<Values>
  onCancel: () => void
}

interface FormProps {
  type?: Account.Type
  color?: string
}

type AllProps = FormProps & ReduxFormProps<Values> & Props & IntlProps

export interface Values {
  color: string
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
  onlyUpdateForPropTypes,
  setPropTypes({
    title: React.PropTypes.object.isRequired,
    edit: React.PropTypes.object,
    accounts: React.PropTypes.array.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  withProps<{}, Props & IntlProps>(({onSubmit}) => ({
    onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
      const { intl: { formatMessage } } = props
      const v = new Validator(values)
      v.required(['name', 'number', 'type'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()
      return onSubmit(values, dispatch, props)
    }
  })),
  reduxForm<Props & IntlProps, Values>({
    form: formName,
    validate: (values: Values, props: AllProps) => {
      const v = new Validator(values)
      const { edit, accounts, intl: { formatMessage } } = props
      const otherAccounts = accounts.filter(acct => !edit || edit._id !== acct.doc._id)
      const otherNames = otherAccounts.map(acct => acct.doc.name)
      const otherNumbers = otherAccounts.filter(acct => acct.doc.type === v.values.type).map(acct => acct.doc.number)
      v.unique('name', otherNames, formatMessage(messages.uniqueName))
      v.unique('number', otherNumbers, formatMessage(messages.uniqueNumber))
      return v.errors
    }
  }),
  withPropChangeCallback<ReduxFormProps<Values> & Props & IntlProps>('edit', (props: AllProps) => {
    const { edit, initialize } = props
    if (edit) {
      const values = edit
      initialize(values, false)
    } else {
      const values = {
        color: Account.generateColor()
      }
      initialize(values, false)
    }
  }),
  connect<FormProps, {}, ReduxFormProps<Values> & Props & IntlProps>(
    (state: AppState): FormProps => ({
      type: formSelector(state, 'type'),
      color: formSelector(state, 'color')
    })
  )
)

export const AccountForm = enhance((props) => {
  const { title, edit, type, onSubmit, onCancel, handleSubmit, change, color } = props
  const { formatMessage } = props.intl
  return (
    <Modal show={true} onHide={onCancel} backdrop='static'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage {...title}/>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={'form-horizontal'}>
          <TextField
            addonBefore={
              <InputGroup.Button>
                <ColorPicker value={color} onChange={(c) => change('color', c)}/>
              </InputGroup.Button>
            }
            name='name'
            autoFocus
            label={formatMessage(messages.name)}
          />
          <SelectField
            name='type'
            options={typeOptions}
            clearable={false}
            optionRenderer={accountTypeRenderer}
            valueRenderer={accountTypeRenderer}
            label={formatMessage(messages.type)}
          />
          <TextField
            name='number'
            label={formatMessage(messages.number)}
          />
          {(type === Account.Type.CHECKING || type === Account.Type.SAVINGS) &&
            <TextField
              name='bankid'
              label={formatMessage(messages.bankid)}
            />
          }
          {(type === Account.Type.CREDITCARD) &&
            <TextField
              name='key'
              label={formatMessage(messages.key)}
            />
          }
        </Modal.Body>

        <Modal.Footer>
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
        </Modal.Footer>
      </form>
    </Modal>
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
