import { Grid, Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo } from '../../docs'
import { AppState, dbActions } from '../../state'
import { Validator } from '../../util'
import { forms, typedFields } from './forms'
import { IntlProps, RouteProps } from './props'

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

interface ConnectedProps {
  lang: string
}

interface DispatchedProps {
  createDb(title: string, password: string, lang: string): Promise<DbInfo.Doc>
}

type AllProps = IntlProps & ConnectedProps & DispatchedProps & ReduxFormProps<Values> & RouteProps<any>

interface Values {
  name: string
  password: string
  confirmPassword: string
}

const { TextField, PasswordField } = typedFields<Values>()

export const DbCreateComponent = (props: AllProps) => {
  const { handleSubmit } = props
  const { formatMessage } = props.intl
  return (
    <Grid>
      <p>{formatMessage(messages.welcome)}</p>
      <form onSubmit={handleSubmit(submit)}>
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
        <div>
          <ButtonToolbar className='pull-right'>
            <Button
              type='button'
              onClick={() => props.router.goBack()}
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
        </div>
      </form>
    </Grid>
  )
}

const validate = (values: Values, props: IntlProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.equal('confirmPassword', 'password', formatMessage(forms.passwordsMatch))
  return v.errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name', 'password', 'confirmPassword'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { router } = props
  const dbInfo = await dispatch(dbActions.createDb(values.name, values.password, props.lang))
  router.replace(DbInfo.to.view(dbInfo))
}

const formName = 'DbCreate'

export const DbCreate = compose(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang
    })
  ),
  reduxForm<AllProps, Values>({
    form: formName,
    validate
  })
)(DbCreateComponent) as React.ComponentClass<{}>
