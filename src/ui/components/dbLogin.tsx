import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, Field, ReduxFormProps, SubmissionError } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { createSelector } from 'reselect'
import { DbInfo } from '../../docs'
import { AppState, AppDispatch, historyAPI, loadDb } from '../../state'
import { RouteProps, IntlProps } from './props'
import { forms } from './forms'
import { connect } from 'react-redux'

interface Props {
}

interface ConnectedProps extends ReduxFormProps<any> {
  dbDoc: DbInfo.Doc
}

type AllProps = Props & RouteProps & ConnectedProps & IntlProps

const translations = defineMessages({
  login: {
    id: 'login',
    defaultMessage: 'Enter password for database {db}'
  }
})

const style = {
  button: {
    margin: '16px 16px 16px 16px'
  }
}

export const DbLoginComponent = (props: AllProps) => {
  const formatMessage = props.intl.formatMessage!
  if (!props.dbDoc) {
    return null as any as JSX.Element
  }
  const db = props.dbDoc.title
  const { handleSubmit } = props
  return (
    <div>
      <p>
        <FormattedMessage {...translations.login} values={{db}}/>
      </p>
      <form onSubmit={handleSubmit!(submit)}>
        <div>
          <Field
            name='password'
            type='password'
            autoFocus
            component={TextField}
            hintText={formatMessage(forms.translations.password)}
            floatingLabelText={formatMessage(forms.translations.password)}
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
            label={formatMessage(forms.translations.login)}
            style={style.button}
            primary
          />
        </div>
      </form>
    </div>
  )
}

const selectDbDoc = (state: AppState, props: RouteProps) => {
  const dbs = state.cache.dbs
  const db = props.params!.db
  return dbs.get(DbInfo.docId({db}))!
}

// const selectDbDoc = createSelector(
//   (state: AppState, props: RouteProps) => state.cache.dbs,
//   (state: AppState, props: RouteProps) => props.params!.db,
//   (dbs, db) => {
//     return dbs.get(DbInfo.docId({db}))!
//   }
// )

interface Values {
  password?: string

  [key: string]: string | undefined
}

const validate = (values: Values, props: IntlProps) => {
  const formatMessage = props.intl.formatMessage!
  const errors: Values = {}
  const requiredFields = [ 'password' ]
  requiredFields.forEach(field => {
    if (!values[ field ]) {
      errors[ field ] = formatMessage(forms.translations.required)
    }
  })
  return errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { dbDoc } = props
  const errors = validate(values, props)
  if (Object.keys(errors).length) {
    throw new SubmissionError<Values>(errors)
  }
  try {
    await dispatch(loadDb(DbInfo.idFromDocId(dbDoc!._id), values.password!))
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
  reduxForm<AllProps>(
    {
      form: 'DbLogin'
    }
  )
)(DbLoginComponent) as React.ComponentClass<Props>
