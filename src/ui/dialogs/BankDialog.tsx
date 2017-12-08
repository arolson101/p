import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Modal, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { saveBank } from 'core/actions'
import { Bank } from 'core/docs'
import { AppState, FI, emptyfi, mapDispatchToProps, setDialog } from 'core/state'
import { formatAddress } from 'util/index'
import { typedFields, forms } from '../components/forms'

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
  onHide: () => void
}

interface StateProps {
  filist: FI[]
}

interface DispatchProps {
  saveBank: saveBank.Fcn
  push: (path: string) => void
}

type ConnectedProps = StateProps & DispatchProps & Props
type EnhancedProps = ConnectedProps & Props & InjectedIntlProps

export const BankDialogStatic = {
  dialog: 'BankDialog'
}

export const showBankDialog = (params: Params) => setDialog(BankDialogStatic.dialog, params)

type Values = saveBank.Values

const { Form, TextField, PasswordField, UrlField, SelectField, CheckboxField, CollapseField } = typedFields<Values>()

const enhance = compose<EnhancedProps, ConnectedProps>(
  setDisplayName('BankDialog'),
  injectIntl,
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    onHide: PropTypes.func.isRequired
  }),
)

export namespace BankDialogComponent {
  export type Props = ConnectedProps
}
export const BankDialogComponent = enhance((props) => {
  const { edit, filist } = props
  const { onHide } = props
  const title = edit ? messages.editTitle : messages.createTitle

  let defaultValues: Partial<Values> = {}
  if (edit) {
    const fi = filist.findIndex(fiEntry => fiEntry.name === edit.doc.fi) + 1
    const { _id, _rev, _deleted, _conflicts, _attachments, accounts, login, ...doc } = edit.doc
    defaultValues = { ...doc, ...login, fi }
  }

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...title}/>
        </Modal.Title>
      </Modal.Header>

      <Form
        horizontal
        defaultValues={defaultValues}
        onSubmit={async (values, state, api, instance) => {
          const { edit, filist, onHide, saveBank, intl: { formatMessage }, push } = props

          const doc = await saveBank({ edit: edit && edit.doc, filist, formatMessage, values })

          if (!edit) {
            push(Bank.to.view(doc))
          }

          onHide()
        }}
      >
        {api =>
          <div>
            <Modal.Body>
              <div className='form-horizontal container-fluid' style={{ paddingBottom: 10 }}>
                <SelectField
                  autofocus
                  name='fi'
                  label={messages.fi}
                  options={filist as any}
                  labelKey='name'
                  valueKey='id'
                  onChange={(newValue: FI | null) => {
                    const value = newValue || emptyfi
                    api.setValue('name', value.name)
                    api.setValue('web', value.profile.siteURL)
                    api.setValue('favicon', '')
                    api.setValue('address', formatAddress(value))
                    api.setValue('fid', value.fid)
                    api.setValue('org', value.org)
                    api.setValue('ofx', value.ofx)
                  }}
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
          </div>
        }
      </Form>
    </div>
  )
})

export const BankDialog = connect<StateProps, DispatchProps, Props>(
  (state: AppState): StateProps => ({
    filist: state.fi.list,
  }),
  mapDispatchToProps<DispatchProps>({ saveBank, push })
)(BankDialogComponent)
