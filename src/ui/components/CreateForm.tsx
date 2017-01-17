import { Grid, Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo } from '../../docs'
import { AppState, dbActions } from '../../state'
import { Validator } from '../../util'
import { forms, typedFields } from './forms'
import { IntlProps } from './props'

const messages = defineMessages({
  welcome: {
    id: 'dbCreate.welcome',
    defaultMessage: 'Welcome!  Please give your database a name and set the password'
  },
  name: {
    id: 'dbCreate.name',
    defaultMessage: 'Database Name'
  }
})

interface Props {
  onCreate: (dbInfo: DbInfo.Doc) => void
  onCancel: () => void
}

interface ConnectedProps {
  lang: string
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => Promise<any>
}

type AllProps = IntlProps & Props & EnhancedProps & ConnectedProps & ReduxFormProps<Values>

interface Values {
  name: string
  password: string
  confirmPassword: string
}

const enhance = compose<AllProps, Props>(
  setDisplayName('CreateForm'),
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang
    })
  ),
  withProps({
    onSubmit: async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
      const { onCreate, intl: { formatMessage } } = props
      const v = new Validator(values)
      v.required(['name', 'password', 'confirmPassword'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()

      const dbInfo = await dispatch(dbActions.createDb(values.name, values.password, props.lang))
      onCreate(dbInfo)
    }
  } as EnhancedProps),
  reduxForm<AllProps, Values>({
    form: 'CreateForm',
    validate: (values: Values, props: IntlProps) => {
      const { formatMessage } = props.intl
      const v = new Validator(values)
      v.equal('confirmPassword', 'password', formatMessage(forms.passwordsMatch))
      return v.errors
    }
  })
)

const { TextField, PasswordField } = typedFields<Values>()

export const CreateForm = enhance((props) => {
  const { handleSubmit, onCancel, intl: { formatMessage } } = props
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <TextField
          name='name'
          autoFocus
          label={formatMessage(messages.name)}
        />
      </div>
      <div>
        <PasswordField
          name='password'
          label={formatMessage(forms.password)}
        />
      </div>
      <div>
        <PasswordField
          name='confirmPassword'
          label={formatMessage(forms.confirmPassword)}
        />
      </div>
      <ButtonToolbar>
        <Button
          type='button'
          onClick={onCancel}
        >
          {formatMessage(forms.cancel)}
        </Button>
        <Button
          type='submit'
          bsStyle='primary'
        >
          {formatMessage(forms.create)}
        </Button>
      </ButtonToolbar>
    </form>
  )
})

