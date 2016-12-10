import { Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { AppState, AppDispatch, historyAPI, createDb } from '../../state'
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
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & ReduxFormProps<Values> & RouteProps<any>

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
    <div>
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
          <ButtonToolbar>
            <Button
              type='button'
              bsSize='large'
              onClick={() => historyAPI.go(-1)}
            >
              {formatMessage(forms.cancel)}
            </Button>
            <Button
              type='submit'
              bsStyle='primary'
              bsSize='large'
            >
              {formatMessage(forms.create)}
            </Button>
          </ButtonToolbar>
        </div>
      </form>
    </div>
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

  await dispatch(createDb(values.name))
  historyAPI.push('/')
}

export const DbCreate = compose(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({}),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  ),
  reduxForm<AllProps, Values>({
    form: 'DbCreate',
    validate
  })
)(DbCreateComponent) as React.ComponentClass<Props>
