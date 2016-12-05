import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, Field, ReduxFormProps } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { DbInfo } from '../../docs'
import { AppState, AppDispatch, historyAPI, CreateDb } from '../../state'
import { Validator } from '../../util'
import { forms } from './forms'
import { IntlProps } from './props'

const translations = defineMessages({
  name: {
    id: 'in.name',
    defaultMessage: 'Institution'
  }
})

interface ConnectedProps {
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & ReduxFormProps<any>

const style = {
  button: {
    margin: '16px 32px 16px 0'
  }
}

export const InCreateComponent = (props: AllProps) => {
  const formatMessage = props.intl.formatMessage
  const { handleSubmit } = props
  return (
    <div>
      <form onSubmit={handleSubmit(submit)}>
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
            label={formatMessage(forms.translations.create)}
            style={style.button}
            primary
          />
        </div>
      </form>
    </div>
  )
}

interface Values {
  name: string
  password: string
  confirmPassword: string
}

const validate = (values: Values, props: IntlProps) => {
  const formatMessage = props.intl.formatMessage
  const v = new Validator(values)
  v.equal('confirmPassword', 'password', formatMessage(forms.translations.passwordsMatch))
  return v.errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const formatMessage = props.intl.formatMessage
  const v = new Validator(values)
  v.required(['name', 'password', 'confirmPassword'], formatMessage(forms.translations.required))
  v.maybeThrowSubmissionError()

  const dbInfo = await dispatch(CreateDb(values.name, values.password))
  historyAPI.push(DbInfo.path(dbInfo))
}

export const InCreate = compose(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({}),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  ),
  reduxForm<AllProps>({
    form: 'InCreate',
    validate
  })
)(InCreateComponent) as React.ComponentClass<Props>
