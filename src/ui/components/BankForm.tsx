import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Modal, ModalProps, PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withPropsOnChange, withHandlers, onlyUpdateForPropTypes, setPropTypes, getContext } from 'recompose'
import { reduxForm, FormProps, formValueSelector } from 'redux-form'
import { getFavicon } from '../../actions/index'
import { Bank } from '../../docs/index'
import { AppState, FI, emptyfi, pushChanges, mapDispatchToProps } from '../../state/index'
import { withPropChangeCallback } from '../enhancers/index'
import { formatAddress } from '../../util/index'
import { typedFields, forms, SubmitHandler } from './forms/index'
import { IconPicker } from './forms/IconPicker'
import { AppContentContext, AppContentContextTypes } from './AppContent'

const messages = defineMessages({
  createTitle: {
    id: 'BankForm.createTitle',
    defaultMessage: 'Add Institution'
  },
  editTitle: {
    id: 'BankForm.editTitle',
    defaultMessage: 'Edit Institution'
  },
  fi: {
    id: 'BankForm.fi',
    defaultMessage: 'Institution'
  },
  fiHelp: {
    id: 'BankForm.fiHelp',
    defaultMessage: 'Choose a financial institution from the list or fill in the details below'
  },
  fiPlaceholder: {
    id: 'BankForm.fiPlaceholder',
    defaultMessage: 'Select financial institution...'
  },
  name: {
    id: 'BankForm.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'BankForm.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'BankForm.address',
    defaultMessage: 'Address'
  },
  notes: {
    id: 'BankForm.notes',
    defaultMessage: 'Notes'
  },
  online: {
    id: 'BankForm.online',
    defaultMessage: 'Online'
  },
  fid: {
    id: 'BankForm.fid',
    defaultMessage: 'Fid'
  },
  org: {
    id: 'BankForm.org',
    defaultMessage: 'Org'
  },
  ofx: {
    id: 'BankForm.ofx',
    defaultMessage: 'OFX Server'
  },
  username: {
    id: 'BankForm.username',
    defaultMessage: 'Username'
  },
  password: {
    id: 'BankForm.password',
    defaultMessage: 'Password'
  }
})

interface Props {
  show: boolean
  onHide: () => void
  edit?: Bank.Doc
}

interface ConnectedProps {
  filist: FI[]
  lang: string
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface Handlers {
  onChangeFI: (event: any, index: number) => void
}

type EnhancedProps = AppContentContext & Handlers & FormProps<Values, any, any> & ConnectedProps & Props

export type SubmitFunction<V> = SubmitHandler<V>

export interface Values {
  fi: number

  name: string
  web: string
  address: string
  notes: string
  favicon: string

  online: boolean

  fid: string
  org: string
  ofx: string

  username: string
  password: string
}

const { Form, TextField, PasswordField, UrlField, SelectField, CheckboxField, CollapseField } = typedFields<Values>()

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('BankDialog'),
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
  }),
  getContext<AppContentContext, Props>(
    AppContentContextTypes
  ),
  connect<ConnectedProps, {}, Props>(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      lang: state.i18n.locale,
    }),
  ),
  withPropsOnChange<any, ConnectedProps & Props>(
    ['edit', 'filist'],
    ({ edit, filist }) => {
      if (edit) {
        const fi = filist.findIndex(fiEntry => fiEntry.name === edit.fi) + 1
        const initialValues = { ...edit, ...edit.login, fi }
        return { initialValues }
      }
    }
  ),
  reduxForm<Values, ConnectedProps & DispatchProps & Props, AppState>({
    form: 'BankForm',
    enableReinitialize: true,
    onSubmit: async (values, dispatch, props) => {
      const {edit, filist, onHide, pushChanges} = props
      const { fi, username, password, ...newValues } = values
      const doc: Bank.Doc = {
        ...edit,
        ...newValues,

        fi: fi ? filist[fi - 1].name : undefined,
        login: {
          username: username,
          password: password
        }
      }
      await pushChanges({docs: [doc]})

      onHide()
    },
  }),
  withHandlers<Handlers, FormProps<Values, any, any> & ConnectedProps & DispatchProps & Props>({
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
  const { edit, handleSubmit, onChangeFI, filist } = props
  const { show, onHide, container } = props
  const title = edit ? messages.editTitle : messages.createTitle

  return (
    <Modal container={container} show={show} onHide={onHide}>
      <Modal.Header>
        <Modal.Title>
          <FormattedMessage {...title}/>
        </Modal.Title>

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
                options={filist}
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

      </Modal.Header>
    </Modal>
  )
})
