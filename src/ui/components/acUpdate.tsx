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
import { forms } from './forms'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectBank, selectBankAccounts, selectAccount } from './selectors'
import { Values, AcForm } from './acForm'

const messages = defineMessages({
  page: {
    id: 'acUpdate.page',
    defaultMessage: 'Edit'
  }
})

interface ConnectedProps {
  current?: CurrentDb
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  accounts?: Account.Doc[]
  account?: Account.Doc
}

type AllProps = IntlProps & ConnectedProps & ReduxFormProps<Values> & RouteProps<Account.Params>

export const AcUpdateComponent = (props: AllProps) => {
  const { bank, account, handleSubmit, router } = props
  const { formatMessage } = props.intl
  return (
    <div>
      {bank && account &&
        <Grid>
          <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
          <form onSubmit={handleSubmit(submit)}>
            <AcForm {...props} account={account}/>
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
                  {formatMessage(forms.save)}
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
  if (props.account && props.accounts) {
    const thisid = props.account._id
    const otherAccounts = props.accounts.filter(acct => acct._id !== thisid)
    AcForm.validate(v, props, otherAccounts)
  }
  return v.errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name', 'number'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { current, router } = props
  const account = props.account!

  const doc: Account.Doc = {
    ...account,

    name: values.name,
    type: values.type,
    number: values.number,
    visible: true
  }

  await current!.db.put(doc)

  router.replace(Account.to.read(doc))
}

export const AcUpdate = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: state.db.current,
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      accounts: selectBankAccounts(state, props),
      account: selectAccount(state, props)
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'AcUpdate',
    validate
  })
)(AcUpdateComponent) as React.ComponentClass<AllProps>
