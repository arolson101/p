import * as React from 'react'
import { Modal, ModalProps, PageHeader, InputGroup, ButtonToolbar, Button, SplitButton, MenuItem } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, withState, withHandlers } from 'recompose'
import { Dispatch } from 'redux'
import { DbInfo } from 'core/docs'
import { AppState, loadDb, deleteDb, setDialog, mapDispatchToProps } from 'core/state'
import { Validator } from 'util/index'
import { typedFields, forms } from '../components/forms'
import { ContainedModal } from './ContainedModal'

export const LoginDialogStatic = {
  dialog: 'LoginDialog'
}

export const showLoginDialog = (params: Params) => setDialog(LoginDialogStatic.dialog, params)

interface Params {
  info: DbInfo
}

interface Props extends Params {
  onHide: () => void
}

interface State {
  submitting: boolean
  setSubmitting: (submitting: boolean) => void
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
  push: typeof push
}

type ConnectedProps = Props & DispatchProps
type EnhancedProps = Handlers & State & ConnectedProps & IntlProps

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

const enhance = compose<EnhancedProps, ConnectedProps>(
  setDisplayName('LoginDialog'),
  injectIntl,
  withState('submitting', 'setSubmitting', false),
  withState('deleting', 'setDeleting', false),
  withHandlers<State & DispatchProps & Props & IntlProps, Handlers>({
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
)

const { Form2, PasswordField2 } = typedFields<Values>()

export const LoginDialogComponent = enhance(props => {
  if (!props.info) {
    return null as any
  }
  const { onHide, deleting, onCancelDelete,
    onDelete, onDeleteConfirmed, intl: { formatMessage }, setSubmitting, submitting } = props

  return (
    <div>
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
        <Form2
          horizontal
          onSubmit={async (values, state, api, instance) => {
            try {
              const { loadDb, push, intl: { formatMessage }, info, onHide } = props
              const v = new Validator(values, formatMessage)
              v.required('password')
              v.maybeThrowSubmissionError()

              try {
                const { password } = values
                setSubmitting(true)
                await loadDb({info, password})
                setSubmitting(false)
                push('/home') // push(DbInfo.to.home())
                onHide()
              } catch (error) {
                setSubmitting(false)
                state.errors = {password: error.message}
                instance.setAllTouched()
                return
              }
            } catch (err) {
              Validator.setErrors(err, state, instance)
            }
          }}
        >
          {api =>
            <div>
              <Modal.Body>
                <PasswordField2
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
            </div>
          }
        </Form2>
      )}
    </div>
  )
})

export const LoginDialog = connect<{}, DispatchProps, Props>(
  () => ({}),
  mapDispatchToProps<DispatchProps>({ loadDb, deleteDb, push })
)(LoginDialogComponent)
