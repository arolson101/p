import { Modal, ModalProps, PageHeader, Row, ButtonToolbar, Button } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { reduxForm, FormProps } from 'redux-form'
import { DbInfo } from '../../docs/index'
import { AppState, createDb, setDialog, mapDispatchToProps } from '../../state/index'
import { Validator } from '../../util/index'
import { forms, typedFields } from '../components/forms'
import { ContainedModal } from './ContainedModal'

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
  show: boolean
  onHide: () => void
}

interface ConnectedProps {
  files: DbInfo[]
}

interface DispatchProps {
  createDb: createDb.Fcn
  push: typeof push
}

type EnhancedProps = IntlProps & Props & ConnectedProps & DispatchProps & FormProps<Values, {}, {}>

interface Values {
  name: string
  password: string
  confirmPassword: string
}

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('CreateForm'),
  connect<ConnectedProps, DispatchProps, Props & IntlProps>(
    (state: AppState) => ({
      files: state.db.files
    }),
    mapDispatchToProps<DispatchProps>({ createDb, push })
  ),
  injectIntl,
  reduxForm<Values, ConnectedProps & DispatchProps & Props & IntlProps>({
    form: 'CreateForm',
    validate: ((values, props) => {
      const { files, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      const names = files.map(info => info.name)
      v.unique('name', names, messages.uniqueName)
      v.equal('confirmPassword', 'password', forms.passwordsMatch)
      return v.errors
    }),
    onSubmit: async (values, dispatch, props) => {
      const { createDb, onHide, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      v.required('name', 'password', 'confirmPassword')
      v.maybeThrowSubmissionError()

      const { name, password } = values
      await createDb({name, password})
      push(DbInfo.to.home())
      onHide()
    }
  })
)

const { Form, TextField, PasswordField } = typedFields<Values>()

export const CreateDbDialog = enhance((props) => {
  const { show, reset, handleSubmit, onHide, intl: { formatMessage } } = props
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
          <FormattedMessage {...messages.title}/>
        </Modal.Title>
      </Modal.Header>

      <Form horizontal onSubmit={handleSubmit}>
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
      </Form>
    </ContainedModal>
  )
})
