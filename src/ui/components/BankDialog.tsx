import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Modal, ModalProps, PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withPropsOnChange, withHandlers, onlyUpdateForPropTypes, setPropTypes, getContext } from 'recompose'
import { reduxForm, FormProps, formValueSelector } from 'redux-form'
import { getFavicon } from '../../actions/index'
import { Bank } from '../../docs/index'
import { AppState, FI, emptyfi, pushChanges, mapDispatchToProps } from '../../state/index'
import { formatAddress } from '../../util/index'
import { Validator } from '../../util/index'
import { AppContentContext, AppContentContextTypes } from './AppContent'
import { typedFields, forms, SubmitHandler } from './forms/index'
import { IconPicker } from './forms/IconPicker'

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

type EnhancedProps = AppContentContext & Handlers & FormProps<Values, any, any> & ConnectedProps & Props & InjectedIntlProps

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
  injectIntl,
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  }),
  getContext<AppContentContext, Props>(
    AppContentContextTypes
  ),
  connect<ConnectedProps, {}, Props>(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      lang: state.i18n.locale,
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
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
  reduxForm<Values, ConnectedProps & DispatchProps & InjectedIntlProps & Props, AppState>({
    form: 'BankDialog',
    enableReinitialize: true,
    onSubmit: async (values, dispatch, props) => {
      const { edit, filist, onHide, pushChanges, lang, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      v.required('name')
      v.maybeThrowSubmissionError()

      const { fi, username, password, ...newValues } = values
      const doc: Bank.Doc = Bank.doc({
        accounts: [],

        ...edit,
        ...newValues,

        fi: fi ? filist[fi - 1].name : undefined,
        login: {
          username: username,
          password: password
        }
      }, lang)
      await pushChanges({docs: [doc]})

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
  const { show, onHide, container } = props
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
    </Modal>
  )
})
