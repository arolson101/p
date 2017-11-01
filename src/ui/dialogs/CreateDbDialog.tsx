import { Modal, ButtonToolbar, Button } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName } from 'recompose'
import { DbInfo } from 'core/docs'
import { AppState, createDb, setDialog, mapDispatchToProps } from 'core/state'
import { Validator } from 'util/index'
import { forms, typedFields } from '../components/forms'

export const CreateDbDialogStatic = {
  dialog: 'CreateDbDialog'
}

export const showCreateDialog = () => setDialog(CreateDbDialogStatic.dialog, {})

const messages = defineMessages({
  title: {
    id: 'CreateDbDialog.title',
    defaultMessage: 'Create Database'
  },
  name: {
    id: 'CreateDbDialog.name',
    defaultMessage: 'Name'
  },
  uniqueName: {
    id: 'CreateDbDialog.uniqueName',
    defaultMessage: 'This name is already used'
  },
})

interface Props {
  onHide: () => void
}

interface StateProps {
  files: DbInfo[]
}

interface DispatchProps {
  createDb: createDb.Fcn
  push: typeof push
}

type ConnectedProps = StateProps & DispatchProps & Props
type EnhancedProps = IntlProps & ConnectedProps

interface Values {
  name: string
  password: string
  confirmPassword: string
}

const enhance = compose<EnhancedProps, ConnectedProps>(
  setDisplayName('CreateForm'),
  injectIntl,
)

const { Form, TextField, PasswordField } = typedFields<Values>()

export const CreateDbDialogComponent = enhance((props) => {
  const { onHide } = props
  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...messages.title}/>
        </Modal.Title>
      </Modal.Header>

      <Form
        horizontal
        validate={(values) => {
          const { files, intl: { formatMessage } } = props
          const v = new Validator(values, formatMessage)
          const names = files.map(info => info.name)
          v.unique('name', names, messages.uniqueName)
          v.equal('confirmPassword', 'password', forms.passwordsMatch)
          return v.errors
        }}
        onSubmit={async (values, state, api, instance) => {
          try {
            const { createDb, onHide, intl: { formatMessage } } = props
            const v = new Validator(values, formatMessage)
            v.required('name', 'password', 'confirmPassword')
            v.maybeThrowSubmissionError()

            const { name, password } = values
            await createDb({ name, password })
            push('/home') // push(DbInfo.to.home())
            onHide()
          } catch (err) {
            Validator.setErrors(err, state, instance)
          }
        }}
      >
        {props =>
          <div>
            <Modal.Body>
              <TextField
                name='name'
                autoFocus
                label={messages.name}
              />
              <PasswordField
                name='password'
                label={forms.password}
              />
              <PasswordField
                name='confirmPassword'
                label={forms.confirmPassword}
              />
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
                >
                  <FormattedMessage {...forms.create}/>
                </Button>
              </ButtonToolbar>
            </Modal.Footer>
          </div>
        }
      </Form>
    </div>
  )
})

export const CreateDbDialog = connect<StateProps, DispatchProps, Props>(
  (state: AppState) => ({
    files: state.db.files
  }),
  mapDispatchToProps<DispatchProps>({ createDb, push })
)(CreateDbDialogComponent)
