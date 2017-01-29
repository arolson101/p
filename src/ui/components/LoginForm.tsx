import * as React from 'react'
import { ButtonToolbar, Button, SplitButton, MenuItem } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmissionError } from 'redux-form'
import { DbInfo } from '../../docs'
import { AppState, dbActions } from '../../state'
import { Validator } from '../../util'
import { ConfirmDelete } from './ConfirmDelete'
import { DispatchProps, IntlProps } from './props'
import { typedFields, forms } from './forms'

interface Props {
  dbDoc: DbInfo
  onLogin: (dbDoc: DbInfo) => void
  onCancel: () => void
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>) => Promise<any>
  onDelete: () => void
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
  connect(),
  withProps((props: AllProps): EnhancedProps => ({
    onSubmit: async (values: Values, dispatch: Dispatch<AppState>) => {
      const { intl: { formatMessage }, dbDoc, onLogin } = props
      const v = new Validator(values)
      v.required(['password'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()

      try {
        await dispatch(dbActions.loadDb(dbDoc, values.password))
        onLogin(dbDoc)
      } catch (error) {
        throw new SubmissionError<Values>({password: error.message})
      }
    },
    onDelete: () => {
      const { dispatch, dbDoc } = props
      dispatch(dbActions.deleteDb(dbDoc))
    }
  })),
  reduxForm<AllProps, Values>({
    form: 'Password'
  })
)

export const LoginForm = enhance((props) => {
  if (!props.dbDoc) {
    return null as any
  }
  const dbTitle = props.dbDoc.name
  const { handleSubmit, onDelete, onCancel, intl: { formatMessage } } = props
  return (
    <form onSubmit={handleSubmit}>
      <PasswordField
        autoFocus
        name='password'
        label={formatMessage(forms.password)}
      />
      <ButtonToolbar>
        <Button
          type='button'
          onClick={onCancel}
        >
          <FormattedMessage {...forms.cancel}/>
        </Button>
        <SplitButton
          type='submit'
          bsStyle='primary'
          id='open-dropdown'
          title={formatMessage(forms.login)}
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
