import * as React from 'react'
import { ButtonToolbar, Button, SplitButton, MenuItem } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, FormProps, SubmissionError } from 'redux-form'
import { DbInfo } from '../../docs/index'
import { AppState, loadDb, deleteDb, mapDispatchToProps } from '../../state/index'
import { Validator } from '../../util/index'
import { ConfirmDelete } from './ConfirmDelete'
import { IntlProps } from './props'
import { typedFields, forms } from './forms/index'

interface Props {
  info: DbInfo
  onLogin: (info: DbInfo) => void
  onCancel: () => void
}

interface Handlers {
  onDelete: () => void
}

type DispatchProps = {
  loadDb: loadDb.Fcn
  deleteDb: deleteDb.Fcn
}

type EnhancedProps = Props & Handlers & DispatchProps & IntlProps & FormProps<Values, {}, {}>

interface Values {
  password: string
}

const messages = defineMessages({
  deleteDb: {
    id: 'LoginForm.deleteDb',
    defaultMessage: 'Delete Database'
  },
  confirmDeleteTitle: {
    id: 'LoginForm.confirmDeleteTitle',
    defaultMessage: 'Confirm Delete'
  },
  confirmDeleteBody: {
    id: 'LoginForm.confirmDeleteBody',
    defaultMessage: "Are you sure?  You won't be able to undo this"
  }
})

const { Form, PasswordField } = typedFields<Values>()

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('LoginForm'),
  injectIntl,
  connect<{}, DispatchProps, Props>(
    () => ({}),
    mapDispatchToProps<DispatchProps>({ loadDb, deleteDb })
  ),
  withHandlers<Handlers, DispatchProps & Props & IntlProps>({
    onDelete: ({ deleteDb, info }) => () => {
      deleteDb({info})
    }
  }),
  reduxForm<Values, DispatchProps & Props & IntlProps>({
    form: 'Password',
    onSubmit: async (values, dispatch, props) => {
      const { loadDb, intl: { formatMessage }, info, onLogin } = props
      const v = new Validator(values, formatMessage)
      v.required('password')
      v.maybeThrowSubmissionError()

      try {
        const { password } = values
        await loadDb({info, password})
        onLogin(info)
      } catch (error) {
        throw new SubmissionError<Values>({password: error.message})
      }
    },
  })
)

export const LoginForm = enhance((props) => {
  if (!props.info) {
    return null as any
  }
  const { handleSubmit, onDelete, onCancel, intl: { formatMessage }, submitting } = props
  return (
    <Form onSubmit={handleSubmit}>
      <PasswordField
        autoFocus
        name='password'
        label={forms.password}
        disabled={submitting}
      />
      <ButtonToolbar>
        <Button
          type='button'
          onClick={onCancel}
          disabled={submitting}
        >
          <FormattedMessage {...forms.cancel}/>
        </Button>
        <SplitButton
          type='submit'
          bsStyle='primary'
          id='open-dropdown'
          title={formatMessage(forms.login)}
          disabled={submitting}
          pullRight
        >
          <ConfirmDelete
            component={MenuItem}
            event='onSelect'
            title={formatMessage(messages.confirmDeleteTitle)}
            body={formatMessage(messages.confirmDeleteBody)}
            confirm={formatMessage(messages.deleteDb)}
            onConfirmed={onDelete}
          >
            <FormattedMessage {...messages.deleteDb}/>
          </ConfirmDelete>
        </SplitButton>
      </ButtonToolbar>
    </Form>
  )
})
