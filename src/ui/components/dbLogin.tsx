import * as React from 'react'
import { Grid, Button, ButtonToolbar, SplitButton, MenuItem } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps, SubmissionError } from 'redux-form'
import { DbInfo } from '../../docs'
import { AppState, dbActions } from '../../state'
import { Validator } from '../../util'
import { ConfirmDelete } from './confirmDelete'
import { DispatchProps, RouteProps, IntlProps } from './props'
import { typedFields, forms } from './forms'

interface Params {
  db: DbInfo.Id
}

interface ConnectedProps {
  dbDoc: DbInfo.Doc
}

type AllProps = DispatchProps & RouteProps<Params> & ConnectedProps & IntlProps & ReduxFormProps<Values>

interface Values {
  password: string
}

const messages = defineMessages({
  intro: {
    id: 'dbLogin.intro',
    defaultMessage: 'Enter password for database {dbTitle}'
  },
  deleteDb: {
    id: 'dbLogin.deleteDb',
    defaultMessage: 'Delete Database'
  },
  confirmDeleteTitle: {
    id: 'dbLogin.confirmDeleteTitle',
    defaultMessage: 'Confirm Delete'
  },
  confirmDeleteBody: {
    id: 'dbLogin.confirmDeleteBody',
    defaultMessage: "Are you sure?  You won't be able to undo this"
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
    <Grid>
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
          <ButtonToolbar className='pull-right'>
            <Button
              type='button'
              onClick={() => props.router.goBack()}
            >
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <SplitButton
              type='submit'
              bsStyle='primary'
              id='open-dropdown'
              title={formatMessage(forms.login)}
              pullRight
            >
              <ConfirmDelete
                component={MenuItem}
                event='onSelect'
                title={formatMessage(messages.confirmDeleteTitle)}
                body={formatMessage(messages.confirmDeleteBody)}
                confirm={formatMessage(messages.deleteDb)}
                onConfirmed={() => deleteDoc(props)}
              >
                <FormattedMessage {...messages.deleteDb}/>
              </ConfirmDelete>
            </SplitButton>
          </ButtonToolbar>
        </div>
      </form>
    </Grid>
  )
}

const selectDbDoc = (state: AppState, props: RouteProps<Params>) => {
  const dbs = state.db.meta.infos
  const db = props.params.db
  return dbs.get(DbInfo.docId({db}))!
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { intl: { formatMessage }, router, location } = props
  const v = new Validator(values)
  v.required(['password'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  try {
    await dispatch(dbActions.loadDb(props.dbDoc, values.password))
    if (location.state && (location.state as any).nextPathname) {
      router.replace((location.state as any).nextPathname)
    } else {
      // no need to go anywhere - dbRead will switch to rendering authenticated view
    }
  } catch (error) {
    throw new SubmissionError<Values>({password: error.message})
  }
}

const deleteDoc = async (props: AllProps) => {
  const { dispatch, router, dbDoc } = props
  await dispatch(dbActions.deleteDb(dbDoc))
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
)(DbLoginComponent) as React.ComponentClass<{}>
