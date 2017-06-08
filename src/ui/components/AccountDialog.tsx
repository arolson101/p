import * as PropTypes from 'prop-types'
import { Modal, ModalProps, PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, getContext, withHandlers, withPropsOnChange } from 'recompose'
import { reduxForm, formValueSelector, FormProps } from 'redux-form'
import { Bank, Account } from '../../docs/index'
import { Validator } from '../../util/index'
import { AppState, pushChanges, mapDispatchToProps } from '../../state/index'
import { AppContentContext, AppContentContextTypes } from './AppContent'
import { typedFields, forms, SubmitHandler } from './forms/index'
import { IntlProps } from './props'

export { SubmitHandler }

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

interface Props {
  show: boolean
  onHide: () => void
  edit?: Account.Doc
  bank: Bank.View
}

interface ConnectedProps {
  lang: string
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface ConnectedFormProps {
  type?: Account.Type
}

type EnhancedProps = AppContentContext & FormProps<Values, any, any> & ConnectedFormProps & DispatchProps & Props & IntlProps

export interface Values {
  color: string
  name: string
  number: string
  type: Account.Type
  bankid: string
  key: string
}

const form = 'AccountDialog'
const { Form, TextField, SelectField, ColorAddon } = typedFields<Values>()
const valueSelector = formValueSelector(form)

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('AccountDialog'),
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    show: PropTypes.bool.isRequired,
    bank: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired
  }),
  getContext<AppContentContext, Props>(
    AppContentContextTypes
  ),
  injectIntl,
  connect<ConnectedProps, DispatchProps, Props>(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.locale,
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withPropsOnChange<any, FormProps<Values, any, any> & Props>(
    ['edit'],
    ({ edit }) => {
      const initialValues = edit || ({
        color: Account.generateColor(),
      })
      return { initialValues }
    }
  ),
  reduxForm<Values, ConnectedProps & DispatchProps & InjectedIntlProps & Props, AppState>({
    form,
    enableReinitialize: true,
    onSubmit: async (values, dispatch, props) => {
      const { bank, edit, lang, pushChanges, onHide, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      v.required('name', 'number', 'type')
      v.maybeThrowSubmissionError()

      const doc = Account.doc(
        bank.doc,
        {
          visible: true,
          ...edit,
          ...values,
        },
        lang
      )

      const docs: AnyDocument[] = [doc]
      if (!edit) {
        const nextBank: Bank.Doc = { ...bank.doc, accounts: [...bank.doc.accounts, doc._id] }
        docs.push(nextBank)
      }

      await pushChanges({docs})

      onHide()
    },
    validate: ((values, props) => {
      const { edit, bank, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      const otherAccounts = bank.accounts.filter(acct => !edit || edit._id !== acct.doc._id)
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

export const AccountDialog = enhance((props) => {
  const { edit, type, handleSubmit, onHide, show, container, reset } = props
  const { formatMessage } = props.intl
  const title = edit ? messages.editTitle : messages.createTitle
  return (
    <Modal
      container={container}
      show={show}
      onHide={onHide}
      onExited={reset}
      backdrop='static'
      bsSize='large'
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...title}/>
        </Modal.Title>
      </Modal.Header>

      <Form horizontal onSubmit={handleSubmit}>
        <Modal.Body>
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
                onClick={onHide}
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
      </Form>
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
