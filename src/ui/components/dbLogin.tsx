import * as React from 'react'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps, SubmissionError } from 'redux-form'
import { DbInfo } from '../../docs'
import { AppState, AppDispatch, historyAPI, loadDb } from '../../state'
import { Validator } from '../../util'
import { RouteProps, IntlProps } from './props'
import { formFields, forms } from './forms'

interface Props {
}

interface ConnectedProps {
  dbDoc: DbInfo.Doc
}

type AllProps = Props & RouteProps & ConnectedProps & IntlProps & ReduxFormProps<Values>

interface Values {
  password: string
}

const messages = defineMessages({
  intro: {
    id: 'dbLogin.intro',
    defaultMessage: 'Enter password for database {dbTitle}'
  }
})

const { PasswordField } = formFields<Values>()

export const DbLoginComponent = (props: AllProps) => {
  if (!props.dbDoc) {
    return null as any
  }
  const dbTitle = props.dbDoc.title
  const { handleSubmit } = props
  const { formatMessage } = props.intl
  return (
    <div>
      <p>
        <FormattedMessage {...messages.intro} values={{dbTitle}}/>
      </p>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <PasswordField
            name='password'
            label={formatMessage(forms.password)}
          />
        </div>
        <div>
          <ButtonToolbar>
            <Button
              type='button'
              onClick={() => historyAPI.go(-1)}
            >
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <Button
              type='submit'
              bsStyle='primary'
            >
              <FormattedMessage {...forms.login}/>
            </Button>
          </ButtonToolbar>
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

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
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
  reduxForm<AllProps, Values>({
    form: 'DbLogin'
  })
)(DbLoginComponent) as React.ComponentClass<Props>
