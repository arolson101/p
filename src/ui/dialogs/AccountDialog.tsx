import * as PropTypes from 'prop-types'
import { Modal, PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import { Bank, Account } from 'core/docs'
import { Validator } from 'util/index'
import { AppState, mapDispatchToProps, setDialog } from 'core/state'
import { saveAccount } from 'core/actions'
import { selectBankAccounts } from 'core/selectors'
import { typedFields, forms } from '../components/forms'
import { ContainedModal } from './ContainedModal'

const messages = defineMessages({
  createTitle: {
    id: 'AccountDialog.createTitle',
    defaultMessage: 'Add Account'
  },
  editTitle: {
    id: 'AccountDialog.editTitle',
    defaultMessage: 'Edit Account'
  },
  name: {
    id: 'AccountDialog.name',
    defaultMessage: 'Name'
  },
  number: {
    id: 'AccountDialog.number',
    defaultMessage: 'Number'
  },
  type: {
    id: 'AccountDialog.type',
    defaultMessage: 'Type'
  },
  uniqueName: {
    id: 'AccountDialog.uniqueName',
    defaultMessage: 'This account name is already used'
  },
  uniqueNumber: {
    id: 'AccountDialog.uniqueNumber',
    defaultMessage: 'This account number is already used'
  },
  bankid: {
    id: 'AccountDialog.bankid',
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
    id: 'AccountDialog.key',
    defaultMessage: 'Account Key (for international accounts)'
  }
})

interface Params {
  edit?: Account.View
  bank: Bank.View
}

interface Props extends Params {
  onHide: () => void
}

interface StateProps {
  accounts: Account.View[]
}

interface DispatchProps {
  push: (path: string) => void
  saveAccount: saveAccount.Fcn
}

interface ConnectedFormProps {
  type?: Account.Type
}

type ConnectedProps = StateProps & DispatchProps & Props
type EnhancedProps = ConnectedFormProps & ConnectedProps & IntlProps

export const AccountDialogStatic = {
  dialog: 'AccountDialog'
}

export const showAccountDialog = (params: Params) => setDialog(AccountDialogStatic.dialog, params)

type Values = saveAccount.Values

const form = 'AccountDialog'
const { Form2, TextField2, SelectField2, ColorAddon2 } = typedFields<Values>()

const enhance = compose<EnhancedProps, ConnectedProps>(
  setDisplayName('AccountDialog'),
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    bank: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired
  }),
  injectIntl,
)

import { FormField } from 'react-form'

export namespace AccountDialogComponent {
  export type Props = ConnectedProps
}
export const AccountDialogComponent = enhance((props) => {
  const { edit, accounts, type, onHide, intl: { formatMessage } } = props
  const title = edit ? messages.editTitle : messages.createTitle
  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...title}/>
        </Modal.Title>
      </Modal.Header>

      <Form2
        horizontal
        defaultValues={edit ? edit.doc : {
          color: Account.generateColor()
        }}
        onSubmit={async (values, state, api, instance) => {
          const { bank, edit, saveAccount, onHide, intl: { formatMessage }, push } = props
          const v = new Validator(values, formatMessage)
          v.required('name', 'number')
          if (v.hasErrors) {
            state.errors = v.errors
            instance.setAllTouched()
            return
          }

          const doc = await saveAccount({formatMessage, values, bank, edit})
          if (!edit && doc) {
            push(Account.to.view(doc))
          }

          onHide()
        }}
        validate={(values) => {
          const v = new Validator(values, formatMessage)
          const otherAccounts = accounts.filter(acct => !edit || edit.doc._id !== acct.doc._id)
          const otherNames = otherAccounts.map(acct => acct.doc.name)
          const otherNumbers = otherAccounts.filter(acct => acct.doc.type === v.values.type).map(acct => acct.doc.number)
          v.unique('name', otherNames, messages.uniqueName)
          v.unique('number', otherNumbers, messages.uniqueNumber)
          return v.errors
        }}
      >
        <Modal.Body>
          <TextField2
            name='name'
            label={messages.name}
            addonBefore={<ColorAddon2 name='color'/>}
            autoFocus
          />
          <SelectField2
            name='type'
            options={typeOptions}
            clearable={false}
            optionRenderer={accountTypeRenderer}
            valueRenderer={accountTypeRenderer}
            label={messages.type}
          />
          <TextField2
            name='number'
            label={messages.number}
          />
          {(type === Account.Type.CHECKING || type === Account.Type.SAVINGS) &&
            <TextField2
              name='bankid'
              label={messages.bankid}
            />
          }
          {(type === Account.Type.CREDITCARD) &&
            <TextField2
              name='key'
              label={messages.key}
            />
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
      </Form2>
    </div>
  )
})

export const AccountDialog = connect<StateProps, DispatchProps, Props>(
  (state: AppState, props): StateProps => ({
    accounts: selectBankAccounts(state, props && props.bank.doc._id)
  }),
  mapDispatchToProps<DispatchProps>({ saveAccount, push })
)(AccountDialogComponent)

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
