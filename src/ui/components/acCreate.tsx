import { Grid, Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { forms } from './forms'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectInstitution, selectInstitutionAccounts } from './selectors'
import { Values, AcForm } from './acForm'

const messages = defineMessages({
  page: {
    id: 'acCreate.page',
    defaultMessage: 'Add Account'
  }
})

interface ConnectedProps {
  current?: CurrentDb
  dbInfo?: DbInfo.Doc
  institution?: Institution.Doc
  accounts?: Account.Doc[]
  lang: string
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & ReduxFormProps<Values> & RouteProps<Account.Params>

export const AcCreateComponent = (props: AllProps) => {
  const { institution, handleSubmit, router } = props
  const { formatMessage } = props.intl
  return (
    <div>
      {institution &&
        <Grid>
          <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
          <form onSubmit={handleSubmit(submit)}>
            <AcForm {...props}/>
            <div>
              <ButtonToolbar className='pull-right'>
                <Button
                  type='button'
                  onClick={() => router.goBack()}
                >
                  {formatMessage(forms.cancel)}
                </Button>
                <Button
                  type='submit'
                  bsStyle='primary'
                >
                  {formatMessage(forms.create)}
                </Button>
              </ButtonToolbar>
            </div>
          </form>
        </Grid>
      }
    </div>
  )
}

const validate = (values: Values, props: AllProps) => {
  const v = new Validator(values)
  if (props.accounts) {
    const names = props.accounts.map(acct => acct.name)
    const numbers = props.accounts.map(acct => acct.number)
    AcForm.validate(v, props, names, numbers)
  }
  return v.errors
}

const warn = (values: Values, props: AllProps) => {
  const v = new Validator(values)
  if (props.accounts) {
    const names = props.accounts.map(acct => acct.name)
    const numbers = props.accounts.map(acct => acct.number)
    AcForm.warn(v, props, names, numbers)
  }
  return v.errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name', 'number'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { current, router, lang } = props
  const institution = props.institution!

  const account: Account = {
    institution: institution._id,
    name: values.name,
    type: values.type,
    number: values.number,
    visible: true
  }

  const doc = Account.doc(account, lang)
  institution.accounts.push(doc._id)
  await current!.db.bulkDocs([doc, institution])

  router.replace(Account.to.read(doc))
}

export const AcCreate = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: state.db.current,
      lang: state.i18n.lang,
      dbInfo: selectDbInfo(state),
      institution: selectInstitution(state, props),
      accounts: selectInstitutionAccounts(state, props)
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'AcCreate',
    validate,
    warn
  })
)(AcCreateComponent) as React.ComponentClass<Props>
