import * as React from 'react'
import { Modal, ModalProps, PageHeader, InputGroup, ButtonToolbar, Button, SplitButton, MenuItem } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withState, withHandlers } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, FormProps, SubmissionError } from 'redux-form'
import { DbInfo } from '../../docs/index'
import { AppState, loadDb, deleteDb, setDialog, mapDispatchToProps } from '../../state/index'
import { Validator } from '../../util/index'
import { typedFields, forms } from '../components/forms/index'
import { ContainedModal } from './ContainedModal'

export const LoginDialogStatic = {
  dialog: 'LoginDialog'
}

export const showLoginDialog = (params: Params) => setDialog(LoginDialogStatic.dialog, params)

interface Params {
  info: DbInfo
}

interface Props extends Params {
  show: boolean
  onHide: () => void
}

interface State {
  deleting: boolean
  setDeleting: (deleting: boolean) => void
}

interface Handlers {
  onDelete: () => void
  onCancelDelete: () => void
  onDeleteConfirmed: () => void
}

type DispatchProps = {
  loadDb: loadDb.Fcn
  deleteDb: deleteDb.Fcn
}

type EnhancedProps = Props & Handlers & State & DispatchProps & IntlProps & FormProps<Values, {}, {}>

interface Values {
  password: string
}

const messages = defineMessages({
  deleteDb: {
    id: 'LoginDialog.deleteDb',
    defaultMessage: 'Delete Database'
  },
  confirmDeleteTitle: {
    id: 'LoginDialog.confirmDeleteTitle',
    defaultMessage: 'Confirm Delete'
  },
  confirmDeleteBody: {
    id: 'LoginDialog.confirmDeleteBody',
    defaultMessage: "Are you sure?  You won't be able to undo this"
  }
})

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('LoginDialog'),
  injectIntl,
  connect<{}, DispatchProps, Props>(
    () => ({}),
    mapDispatchToProps<DispatchProps>({ loadDb, deleteDb })
  ),
  withState('deleting', 'setDeleting', false),
  withHandlers<Handlers, State & DispatchProps & Props & IntlProps>({
    onDelete: ({ setDeleting }) => () => {
      setDeleting(true)
    },
    onCancelDelete: ({ setDeleting }) => () => {
      setDeleting(false)
    },
    onDeleteConfirmed: ({ deleteDb, info, onHide }) => async () => {
      deleteDb({info})
      onHide()
    }
  }),
  reduxForm<Values, Handlers & State & DispatchProps & Props & IntlProps>({
    form: 'Password',
    onSubmit: async (values, dispatch, props) => {
      const { loadDb, intl: { formatMessage }, info, onHide } = props
      const v = new Validator(values, formatMessage)
      v.required('password')
      v.maybeThrowSubmissionError()

      try {
        const { password } = values
        await loadDb({info, password})
        onHide()
      } catch (error) {
        throw new SubmissionError<Values>({password: error.message})
      }
    },
  })
)

const { Form, PasswordField } = typedFields<Values>()

export const LoginDialog = enhance((props) => {
  if (!props.info) {
    return null as any
  }
  const { show, onHide, reset, handleSubmit, deleting, onCancelDelete,
    onDelete, onDeleteConfirmed, intl: { formatMessage }, submitting } = props

  return (
    <ContainedModal
      show={show}
      onHide={onHide}
      onExited={reset}
      backdrop='static'
      bsSize='large'
    >
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>
          {props.info.name}
        </Modal.Title>
      </Modal.Header>

      {deleting ? [
        <Modal.Body key='body'>
          <FormattedMessage {...messages.confirmDeleteBody}/>
        </Modal.Body>,

        <Modal.Footer key='footer'>
          <ButtonToolbar className='pull-right'>
            <Button
              type='button'
              onClick={onCancelDelete}
            >
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <Button
              onClick={onDeleteConfirmed}
              bsStyle='danger'
            >
              <FormattedMessage {...messages.confirmDeleteTitle}/>
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      ] : (
        <Form horizontal onSubmit={handleSubmit}>
          <Modal.Body>
            <PasswordField
              autoFocus
              name='password'
              label={forms.password}
              disabled={submitting}
            />
          </Modal.Body>

          <Modal.Footer>
            <ButtonToolbar className='pull-right'>
              <Button
                onClick={onDelete}
              >
                <FormattedMessage {...messages.deleteDb}/>
              </Button>

              <Button
                type='button'
                onClick={onHide}
                disabled={submitting}
              >
                <FormattedMessage {...forms.cancel}/>
              </Button>
              <Button
                type='submit'
                bsStyle='primary'
                disabled={submitting}
              >
                <FormattedMessage {...forms.login}/>
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Form>
      )}

    </ContainedModal>
  )
})
