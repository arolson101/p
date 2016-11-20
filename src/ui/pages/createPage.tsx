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
import { bindActionCreators } from 'redux'
import { reduxForm, Field } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { AppState, AppDispatch } from '../../modules'

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
  }
})

interface ConnectedProps {
}

interface IntlProps {
  intl: InjectedIntlProps
}

interface Props {
}

export const CreatePageComponent = (props: Props & IntlProps & ConnectedProps) => {
  const formatMessage = props.intl.formatMessage!
  return (
    <div>
      <p>{formatMessage(translations.welcome)}</p>
        <form>
          <div>
            <Field
              name='name'
              autoFocus
              component={TextField}
              hintText={formatMessage(translations.name)}
              floatingLabelText={formatMessage(translations.name)}
              // ref={(input: HTMLInputElement) => input && input.focus()}
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
            <RaisedButton type='submit' label='submit' />
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

export const CreatePage = injectIntl(reduxForm(
  {
    form: 'createPage',
    validate,
    destroyOnUnmount: !(module as any).hot
  },
  (state: AppState): ConnectedProps => ({}),
  (dispatch: AppDispatch) => bindActionCreators( { }, dispatch ),
)(CreatePageComponent)) as React.ComponentClass<Props>
