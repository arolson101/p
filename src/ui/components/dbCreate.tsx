import Divider from 'material-ui/Divider'
import FontIcon from 'material-ui/FontIcon'
import RaisedButton from 'material-ui/RaisedButton'
import IconMenu from 'material-ui/IconMenu'
import { List, ListItem } from 'material-ui/List'
import MenuItem from 'material-ui/MenuItem'
import { grey400 } from 'material-ui/styles/colors'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import Paper from 'material-ui/Paper'
import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, Field, ReduxFormProps } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { AppState, AppDispatch, historyAPI, CreateDb } from '../../modules'

const translations = defineMessages({
  welcome: {
    id: 'welcome',
    defaultMessage: 'Welcome!  Please give your data store a name and set the password'
  },
  name: {
    id: 'name',
    defaultMessage: 'Data Store Name'
  },
  password: {
    id: 'password',
    defaultMessage: 'Password'
  },
  confirmPassword: {
    id: 'confirmPassword',
    defaultMessage: 'Confirm Password'
  },
  required: {
    id: 'required',
    defaultMessage: 'Required'
  },
  passwordsMatch: {
    id: 'passwordsMatch',
    defaultMessage: 'Passwords must match'
  },
  cancel: {
    id: 'cancel',
    defaultMessage: 'Cancel'
  },
  submit: {
    id: 'submit',
    defaultMessage: 'Create'
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


const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  console.log('submit')
  await wait(1000)

  console.log('dispatching')
  const id = await dispatch(CreateDb(values.name!, values.password!))

  console.log('redirect')
  historyAPI.push(`/${id}/`)
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
            hintText={formatMessage(translations.password)}
            floatingLabelText={formatMessage(translations.password)}
          />
        </div>
        <div>
          <Field
            name='confirmPassword'
            type='password'
            component={TextField}
            hintText={formatMessage(translations.confirmPassword)}
            floatingLabelText={formatMessage(translations.confirmPassword)}
          />
        </div>
        <div>
          <RaisedButton
            type='button'
            label={formatMessage(translations.cancel)}
            style={style.button}
            onTouchTap={() => historyAPI.go(-1)}
          />
          <RaisedButton
            type='submit'
            label={formatMessage(translations.submit)}
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
      errors[ field ] = formatMessage(translations.required)
    }
  })
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = formatMessage(translations.passwordsMatch)
  }
  return errors
}

export const DbCreate = compose(
  injectIntl,
  reduxForm(
    {
      form: 'DbCreate',
      validate,
      // destroyOnUnmount: !(module as any).hot
    },
    (state: AppState): ConnectedProps => ({}),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  )
)(DbCreateComponent) as React.ComponentClass<Props>
