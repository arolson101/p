import { Grid, Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { Values, AccountForm } from './accountForm'
import { forms } from './forms'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectBank, selectBankAccounts } from './selectors'

const messages = defineMessages({
  page: {
    id: 'acCreate.page',
    defaultMessage: 'Add Account'
  }
})

interface ConnectedProps {
  current?: CurrentDb
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  accounts?: Account.Doc[]
  lang: string
}

type AllProps = IntlProps & ConnectedProps & ReduxFormProps<Values> & RouteProps<Account.Params>

export const AccountCreateComponent = (props: AllProps) => {
  const { bank, handleSubmit, router } = props
  const { formatMessage } = props.intl
  return (
    <div>
      {bank &&
        <Grid>
          <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
          <form onSubmit={handleSubmit(submit)}>
            <AccountForm {...props}/>
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
    AccountForm.validate(v, props, props.accounts)
  }
  return v.errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name', 'number'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { current, router, lang } = props
  const bank = props.bank!

  const account: Account = {
    name: values.name,
    type: values.type,
    number: values.number,
    bankid: values.bankid,
    visible: true
  }

  const doc = Account.doc(bank, account, lang)
  bank.accounts.push(doc._id)
  await current!.db.bulkDocs([doc, bank])

  router.replace(Account.to.view(doc))
}

const formName = 'AcCreate'

export const AccountCreate = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: state.db.current,
      lang: state.i18n.lang,
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      accounts: selectBankAccounts(state, props)
    })
  ),
  reduxForm<AllProps, Values>({
    form: formName,
    validate
  })
)(AccountCreateComponent) as React.ComponentClass<{}>
