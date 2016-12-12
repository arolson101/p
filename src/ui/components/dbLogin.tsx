import * as React from 'react'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps, SubmissionError } from 'redux-form'
import { DbInfo } from '../../docs'
import { AppState, dbActions } from '../../state'
import { Validator } from '../../util'
import { DispatchProps, RouteProps, IntlProps } from './props'
import { typedFields, forms } from './forms'

interface Params {
  db: DbInfo.Id
}

interface Props {
}

interface ConnectedProps {
  dbDoc: DbInfo.Doc
}

type AllProps = Props & DispatchProps & RouteProps<Params> & ConnectedProps & IntlProps & ReduxFormProps<Values>

interface Values {
  password: string
}

const messages = defineMessages({
  intro: {
    id: 'dbLogin.intro',
    defaultMessage: 'Enter password for database {dbTitle}'
  }
})

const { PasswordField } = typedFields<Values>()

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
            autoFocus
            name='password'
            label={formatMessage(forms.password)}
          />
        </div>
        <div>
          <ButtonToolbar>
            <Button
              type='button'
              onClick={() => props.router.goBack()}
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
        <hr/>
        <ButtonToolbar>
          <Button
            type='button'
            bsStyle='danger'
            onClick={() => deleteDoc(props)}
          >
            <FormattedMessage {...forms.delete}/>
          </Button>
        </ButtonToolbar>
      </form>
    </div>
  )
}

const selectDbDoc = (state: AppState, props: RouteProps<Params>) => {
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
    await dispatch(dbActions.loadDb(props.dbDoc, values.password))
    // no need to go anywhere - dbRead will switch to rendering authenticated view
  } catch (error) {
    throw new SubmissionError<Values>({password: error.message})
  }
}

const deleteDoc = async (props: AllProps) => {
  const { dispatch, router } = props
  await dispatch(dbActions.deleteDb(props.dbDoc))
  router.replace('/')
}

export const DbLogin = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Params>): ConnectedProps => ({
      dbDoc: selectDbDoc(state, props)
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'Password'
  })
)(DbLoginComponent) as React.ComponentClass<Props>
