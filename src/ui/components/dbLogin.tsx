import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, Field, ReduxFormProps, SubmissionError } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { createSelector } from 'reselect'
import { DbInfo } from '../../docs'
import { AppState, AppDispatch, historyAPI, LoadDb } from '../../state'
import { promisedConnect, Promised } from '../../util'
import { forms } from './forms'

interface Props {
}

interface RouteProps {
  params: {
    db: string
  }
}

interface AsyncProps {
  dbDoc: DbInfo.Doc
}

interface ConnectedProps extends ReduxFormProps<any> {
}

interface DispatchedProps {
  dispatch: AppDispatch
}

interface IntlProps {
  intl: InjectedIntlProps
}

type AllProps = Props & RouteProps & AsyncProps & ConnectedProps & DispatchedProps & IntlProps

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

const queryDbDoc = createSelector(
  (state: AppState, props: RouteProps) => state.db.meta!,
  (state: AppState, props: RouteProps) => props.params.db,
  async (meta, dbInfo: DbInfo.Id): Promise<DbInfo> => {
    const dbDoc = await meta.handle.get(DbInfo.docId({dbInfo}))
    return dbDoc
  }
)

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
    await dispatch(LoadDb(DbInfo.idFromDocId(dbDoc!._id), dbDoc!.title, values.password!))
  } catch (error) {
    throw new SubmissionError<Values>({password: error.message})
  }
}

export const DbLogin = compose(
  injectIntl,
  promisedConnect(
    (state: AppState, props: RouteProps): Promised<AsyncProps> => ({
      dbDoc: queryDbDoc(state, props)
    })
  ) as any,
  reduxForm(
    {
      form: 'DbLogin'
    },
    (state: AppState): ConnectedProps => ({}),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  )
)(DbLoginComponent) as React.ComponentClass<Props>
