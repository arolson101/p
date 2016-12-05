import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, Field, ReduxFormProps, SubmissionError } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { DbInfo } from '../../docs'
import { AppState, AppDispatch, historyAPI, loadDb } from '../../state'
import { Validator } from '../../util'
import { RouteProps, IntlProps } from './props'
import { forms } from './forms'

interface Props {
}

interface ConnectedProps {
  dbDoc: DbInfo.Doc
}

type AllProps = Props & RouteProps & ConnectedProps & IntlProps & ReduxFormProps<any>

const messages = defineMessages({
  intro: {
    id: 'dbLogin.intro',
    defaultMessage: 'Enter password for database {dbTitle}'
  }
})

const style = {
  button: {
    margin: '16px 16px 16px 16px'
  }
}

export const DbLoginComponent = (props: AllProps) => {
  const formatMessage = props.intl.formatMessage
  if (!props.dbDoc) {
    return null as any
  }
  const dbTitle = props.dbDoc.title
  const { handleSubmit } = props
  return (
    <div>
      <p>
        <FormattedMessage {...messages.intro} values={{dbTitle}}/>
      </p>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <Field
            name='password'
            type='password'
            autoFocus
            component={TextField}
            hintText={formatMessage(forms.password)}
            floatingLabelText={formatMessage(forms.password)}
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
            label={formatMessage(forms.login)}
            style={style.button}
            primary
          />
        </div>
      </form>
    </div>
  )
}

const selectDbDoc = (state: AppState, props: RouteProps) => {
  const dbs = state.db.meta.infos
  const db = props.params.db
  return dbs.get(DbInfo.docId({db}))!
}

interface Values {
  password?: string
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const formatMessage = props.intl.formatMessage
  const v = new Validator(values)
  v.required(['password'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  try {
    await dispatch(loadDb(props.dbDoc, values.password))
  } catch (error) {
    throw new SubmissionError<Values>({password: error.message})
  }
}

export const DbLogin = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps): ConnectedProps => ({
      dbDoc: selectDbDoc(state, props)
    }),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  ),
  reduxForm<AllProps>({
    form: 'DbLogin'
  })
)(DbLoginComponent) as React.ComponentClass<Props>
