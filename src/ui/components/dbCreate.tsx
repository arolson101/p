import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, Field, ReduxFormProps } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { AppState, AppDispatch, historyAPI, CreateDb } from '../../modules'
import { forms } from './forms'

const translations = defineMessages({
  welcome: {
    id: 'welcome',
    defaultMessage: 'Welcome!  Please give your database a name and set the password'
  },
  name: {
    id: 'name',
    defaultMessage: 'Database Name'
  }
})

interface ConnectedProps extends ReduxFormProps<any> {
}

interface IntlProps {
  intl: InjectedIntlProps
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps

const style = {
  button: {
    margin: '16px 32px 16px 0'
  }
}

export const DbCreateComponent = (props: AllProps) => {
  const formatMessage = props.intl.formatMessage!
  const { handleSubmit } = props
  return (
    <div>
      <p>{formatMessage(translations.welcome)}</p>
      <form onSubmit={handleSubmit!(submit)}>
        <div>
          <Field
            name='name'
            autoFocus
            component={TextField}
            hintText={formatMessage(translations.name)}
            floatingLabelText={formatMessage(translations.name)}
          />
        </div>
        <div>
          <Field
            name='password'
            type='password'
            component={TextField}
            hintText={formatMessage(forms.translations.password)}
            floatingLabelText={formatMessage(forms.translations.password)}
          />
        </div>
        <div>
          <Field
            name='confirmPassword'
            type='password'
            component={TextField}
            hintText={formatMessage(forms.translations.confirmPassword)}
            floatingLabelText={formatMessage(forms.translations.confirmPassword)}
          />
        </div>
        <div>
          <RaisedButton
            type='button'
            label={formatMessage(forms.translations.cancel)}
            style={style.button}
            onTouchTap={() => historyAPI.go(-1)}
          />
          <RaisedButton
            type='submit'
            label={formatMessage(forms.translations.submit)}
            style={style.button}
            primary
          />
        </div>
      </form>
    </div>
  )
}

interface Values {
  name?: string
  password?: string
  confirmPassword?: string

  [key: string]: string | undefined
}

const validate = (values: Values, props: IntlProps) => {
  const formatMessage = props.intl.formatMessage!
  const errors: Values = {}
  const requiredFields = [ 'name', 'password', 'confirmPassword' ]
  requiredFields.forEach(field => {
    if (!values[ field ]) {
      errors[ field ] = formatMessage(forms.translations.required)
    }
  })
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = formatMessage(forms.translations.passwordsMatch)
  }
  return errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const id = await dispatch(CreateDb(values.name!, values.password!))
  historyAPI.push(`/${id}/`)
}

export const DbCreate = compose(
  injectIntl,
  reduxForm(
    {
      form: 'DbCreate',
      validate
    },
    (state: AppState): ConnectedProps => ({}),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  )
)(DbCreateComponent) as React.ComponentClass<Props>
