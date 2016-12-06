import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo } from '../../docs'
import { AppState, AppDispatch, historyAPI, CreateDb } from '../../state'
import { Validator } from '../../util'
import { forms, formFields } from './forms'
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

type AllProps = Props & IntlProps & ConnectedProps & ReduxFormProps<Values> & RouteProps

interface Values {
  name: string
  password: string
  confirmPassword: string
}

const style = {
  button: {
    margin: '16px 32px 16px 0'
  }
}

const { TextField } = formFields<Values>()

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
            hintText={formatMessage(messages.name)}
            floatingLabelText={formatMessage(messages.name)}
          />
        </div>
        <div>
          <TextField
            name='password'
            type='password'
            hintText={formatMessage(forms.password)}
            floatingLabelText={formatMessage(forms.password)}
          />
        </div>
        <div>
          <TextField
            name='confirmPassword'
            type='password'
            hintText={formatMessage(forms.confirmPassword)}
            floatingLabelText={formatMessage(forms.confirmPassword)}
          />
        </div>
        <div>
          <RaisedButton
            type='button'
            label={formatMessage(forms.cancel)}
            style={style.button}
            onTouchTap={() => historyAPI.go(-1)}
          />
          <RaisedButton
            type='submit'
            label={formatMessage(forms.create)}
            style={style.button}
            primary
          />
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

  const dbInfo = await dispatch(CreateDb(values.name, values.password))
  historyAPI.push(DbInfo.path(dbInfo))
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
