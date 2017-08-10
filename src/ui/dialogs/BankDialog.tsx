import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Modal, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, withPropsOnChange, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { reduxForm, FormProps, formValueSelector } from 'redux-form'
import { saveBank } from 'core/actions'
import { Bank } from 'core/docs'
import { AppState, FI, emptyfi, mapDispatchToProps, setDialog } from 'core/state'
import { formatAddress } from 'util/index'
import { Validator } from 'util/index'
import { typedFields, forms, SubmitHandler } from '../components/forms'
import { ContainedModal } from './ContainedModal'

const messages = defineMessages({
  createTitle: {
    id: 'BankDialog.createTitle',
    defaultMessage: 'Add Institution'
  },
  editTitle: {
    id: 'BankDialog.editTitle',
    defaultMessage: 'Edit Institution'
  },
  fi: {
    id: 'BankDialog.fi',
    defaultMessage: 'Institution'
  },
  fiHelp: {
    id: 'BankDialog.fiHelp',
    defaultMessage: 'Choose a financial institution from the list or fill in the details below'
  },
  fiPlaceholder: {
    id: 'BankDialog.fiPlaceholder',
    defaultMessage: 'Select financial institution...'
  },
  name: {
    id: 'BankDialog.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'BankDialog.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'BankDialog.address',
    defaultMessage: 'Address'
  },
  notes: {
    id: 'BankDialog.notes',
    defaultMessage: 'Notes'
  },
  online: {
    id: 'BankDialog.online',
    defaultMessage: 'Online'
  },
  fid: {
    id: 'BankDialog.fid',
    defaultMessage: 'Fid'
  },
  org: {
    id: 'BankDialog.org',
    defaultMessage: 'Org'
  },
  ofx: {
    id: 'BankDialog.ofx',
    defaultMessage: 'OFX Server'
  },
  username: {
    id: 'BankDialog.username',
    defaultMessage: 'Username'
  },
  password: {
    id: 'BankDialog.password',
    defaultMessage: 'Password'
  }
})

interface Params {
  edit?: Bank.View
}

interface Props extends Params {
  show: boolean
  onHide: () => void
}

interface ConnectedProps {
  filist: FI[]
}

interface DispatchProps {
  saveBank: saveBank.Fcn
  push: (path: string) => void
}

interface Handlers {
  onChangeFI: (event: any, index: number) => void
}

type EnhancedProps = Handlers & FormProps<Values, any, any> & ConnectedProps & Props & InjectedIntlProps

export const BankDialogStatic = {
  dialog: 'BankDialog'
}

export const showBankDialog = (params: Params) => setDialog(BankDialogStatic.dialog, params)

type Values = saveBank.Values

const { Form, TextField, PasswordField, UrlField, SelectField, CheckboxField, CollapseField } = typedFields<Values>()

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('BankDialog'),
  injectIntl,
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  }),
  connect<ConnectedProps, {}, Props>(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
    }),
    mapDispatchToProps<DispatchProps>({ saveBank, push })
  ),
  withPropsOnChange<any, ConnectedProps & Props>(
    ['edit', 'filist'],
    ({ edit, filist }) => {
      if (edit) {
        const fi = filist.findIndex(fiEntry => fiEntry.name === edit.doc.fi) + 1
        const initialValues: Partial<Values> = { ...edit.doc, ...edit.doc.login, fi }
        return { initialValues }
      }
    }
  ),
  reduxForm<Values, ConnectedProps & DispatchProps & InjectedIntlProps & Props, AppState>({
    form: 'BankDialog',
    enableReinitialize: true,
    onSubmit: async (values, dispatch, props) => {
      const { edit, filist, onHide, saveBank, intl: { formatMessage }, push } = props

      const doc = await saveBank({edit: edit && edit.doc, filist, formatMessage, values})

      if (!edit) {
        push(Bank.to.view(doc))
      }

      onHide()
    },
  }),
  withHandlers<Handlers, FormProps<Values, any, any> & ConnectedProps & Props>({
    onChangeFI: ({ filist, change }) => (event: any, index: number) => {
      if (!change) { throw new Error('change is undefined') }
      const value = index ? filist[index - 1] : emptyfi
      change('name', value.name)
      change('web', value.profile.siteURL)
      change('favicon', '')
      change('address', formatAddress(value))
      change('fid', value.fid)
      change('org', value.org)
      change('ofx', value.ofx)
    },
  }),
)

export const BankDialog = enhance((props) => {
  const { edit, handleSubmit, onChangeFI, filist, reset } = props
  const { show, onHide } = props
  const title = edit ? messages.editTitle : messages.createTitle

  return (
    <ContainedModal
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

      <Form
        horizontal
        onSubmit={handleSubmit}
      >

        <Modal.Body>
          <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
            <SelectField
              autofocus
              name='fi'
              label={messages.fi}
              options={filist as any}
              labelKey='name'
              valueKey='id'
              onChange={onChangeFI as any}
              help={messages.fiHelp}
              placeholderMessage={messages.fiPlaceholder}
            />
            <TextField
              name='name'
              label={messages.name}
            />
            <UrlField
              name='web'
              favicoName='favicon'
              label={messages.web}
            />
            <TextField
              name='address'
              rows={4}
              label={messages.address}
            />
            <TextField
              name='notes'
              rows={4}
              label={messages.notes}
            />
            <CheckboxField
              name='online'
              label={messages.online}
              message={messages.online}
            />
            <CollapseField name='online'>
              <div>
                <TextField
                  name='username'
                  label={messages.username}
                />
                <PasswordField
                  name='password'
                  label={messages.password}
                />
                <TextField
                  name='fid'
                  label={messages.fid}
                />
                <TextField
                  name='org'
                  label={messages.org}
                />
                <TextField
                  name='ofx'
                  label={messages.ofx}
                />
              </div>
            </CollapseField>
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
    </ContainedModal>
  )
})
