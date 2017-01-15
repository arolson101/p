import { Grid } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectBank, selectBankAccounts, selectAccount } from './selectors'
import { Values, AccountForm, SubmitFunction } from './accountForm'

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
  accounts: Account.Doc[]
  account?: Account.Doc
}

interface EnhancedProps {
  cancel: () => void
  submit: SubmitFunction<Values>
}

type AllProps = IntlProps & EnhancedProps & ConnectedProps & RouteProps<Account.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountEdit'),
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
  withProps(({router}: AllProps) => ({
    cancel: () => {
      router.goBack()
    },
    submit: async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
      const { current } = props
      const account = props.account!

      const doc: Account.Doc = {
        ...account,

        name: values.name,
        type: values.type,
        number: values.number,
        visible: true
      }

      await current!.db.put(doc)

      router.replace(Account.to.view(doc))
    }
  }))
)

export const AccountEdit = enhance((props: AllProps) => {
  const { bank, account, accounts, submit, cancel } = props
  const { formatMessage } = props.intl
  return (
    <div>
      {bank && account &&
        <Grid>
          <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
          <AccountForm {...props} account={account} accounts={accounts} onSubmit={submit} cancel={cancel}/>
        </Grid>
      }
    </div>
  )
})
