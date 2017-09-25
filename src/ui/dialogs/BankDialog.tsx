import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Modal, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, withPropsOnChange, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { reduxForm, InjectedFormProps, formValueSelector } from 'redux-form'
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
  onHide: () => void
}

interface StateProps {
  filist: FI[]
}

interface DispatchProps {
  saveBank: saveBank.Fcn
  push: (path: string) => void
}

interface Handlers {
  onChangeFI: (event: any, index: number) => void
}

type ConnectedProps = StateProps & DispatchProps & Props
type EnhancedProps = Handlers & ConnectedProps & Props & InjectedIntlProps

export const BankDialogStatic = {
  dialog: 'BankDialog'
}

export const showBankDialog = (params: Params) => setDialog(BankDialogStatic.dialog, params)

type Values = saveBank.Values

const { Form2, TextField2, PasswordField2, UrlField2, SelectField2, CheckboxField2, CollapseField2 } = typedFields<Values>()

const enhance = compose<EnhancedProps, ConnectedProps>(
  setDisplayName('BankDialog'),
  injectIntl,
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    onHide: PropTypes.func.isRequired
  }),
  withHandlers<InjectedFormProps<Values, {}> & StateProps & Props, Handlers>({
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

export namespace BankDialogComponent {
  export type Props = ConnectedProps
}
export const BankDialogComponent = enhance((props) => {
  const { edit, onChangeFI, filist } = props
  const { onHide } = props
  const title = edit ? messages.editTitle : messages.createTitle

  let defaultValues: Partial<Values> = {}
  if (edit) {
    const fi = filist.findIndex(fiEntry => fiEntry.name === edit.doc.fi) + 1
    defaultValues = { ...edit.doc, ...edit.doc.login, fi }
  }

  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...title}/>
        </Modal.Title>
      </Modal.Header>

      <Form2
        horizontal
        defaultValues={defaultValues}
        onSubmit={async (values, state, api, instance) => {
          const { edit, filist, onHide, saveBank, intl: { formatMessage }, push } = props

          const doc = await saveBank({edit: edit && edit.doc, filist, formatMessage, values})

          if (!edit) {
            push(Bank.to.view(doc))
          }

          onHide()
        }}
      >
        {api =>
          <div>
            <Modal.Body>
              <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
                <SelectField2
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
                <TextField2
                  name='name'
                  label={messages.name}
                />
                <UrlField2
                  name='web'
                  favicoName='favicon'
                  label={messages.web}
                />
                <TextField2
                  name='address'
                  rows={4}
                  label={messages.address}
                />
                <TextField2
                  name='notes'
                  rows={4}
                  label={messages.notes}
                />
                <CheckboxField2
                  name='online'
                  label={messages.online}
                  message={messages.online}
                />
                <CollapseField2 name='online'>
                  <div>
                    <TextField2
                      name='username'
                      label={messages.username}
                    />
                    <PasswordField2
                      name='password'
                      label={messages.password}
                    />
                    <TextField2
                      name='fid'
                      label={messages.fid}
                    />
                    <TextField2
                      name='org'
                      label={messages.org}
                    />
                    <TextField2
                      name='ofx'
                      label={messages.ofx}
                    />
                  </div>
                </CollapseField2>
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
      </Form2>
    </div>
  )
})

export const BankDialog = connect<StateProps, DispatchProps, Props>(
  (state: AppState): StateProps => ({
    filist: state.fi.list,
  }),
  mapDispatchToProps<DispatchProps>({ saveBank, push })
)(BankDialogComponent)
