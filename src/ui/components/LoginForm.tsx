import * as React from 'react'
import { ButtonToolbar, Button, SplitButton, MenuItem } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmissionError } from 'redux-form'
import { DbInfo } from '../../docs'
import { AppState, loadDb, deleteDb, mapDispatchToProps } from '../../state'
import { Validator } from '../../util'
import { ConfirmDelete } from './ConfirmDelete'
import { IntlProps } from './props'
import { typedFields, forms } from './forms'

interface Props {
  info: DbInfo
  onLogin: (info: DbInfo) => void
  onCancel: () => void
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>) => Promise<any>
  onDelete: () => void
}

type DispatchProps = {
  loadDb: loadDb.Fcn
  deleteDb: deleteDb.Fcn
}

type AllProps = Props & EnhancedProps & DispatchProps & IntlProps & ReduxFormProps<Values>

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

const { PasswordField } = typedFields<Values>()

const enhance = compose<AllProps, Props>(
  setDisplayName('LoginForm'),
  injectIntl,
  connect<{}, DispatchProps, Props & IntlProps>(
    () => ({}),
    mapDispatchToProps<DispatchProps>({ loadDb, deleteDb })
  ),
  withProps<EnhancedProps, DispatchProps & Props & IntlProps>((props) => ({
    onSubmit: async (values, dispatch) => {
      const { loadDb, intl: { formatMessage }, info, onLogin } = props
      const v = new Validator(values)
      v.required(['password'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()

      try {
        const { password } = values
        await loadDb({info, password})
        onLogin(info)
      } catch (error) {
        throw new SubmissionError<Values>({password: error.message})
      }
    },
    onDelete: () => {
      const { deleteDb, info } = props
      deleteDb({info})
    }
  })),
  reduxForm<EnhancedProps & DispatchProps & Props & IntlProps, Values>({
    form: 'Password'
  })
)

export const LoginForm = enhance((props) => {
  if (!props.info) {
    return null as any
  }
  const dbTitle = props.info.name
  const { handleSubmit, onDelete, onCancel, intl: { formatMessage }, submitting } = props
  return (
    <form onSubmit={handleSubmit}>
      <PasswordField
        autoFocus
        name='password'
        label={formatMessage(forms.password)}
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
    </form>
  )
})
