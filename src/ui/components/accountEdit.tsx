import { Grid } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Dispatch } from 'redux'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { IntlProps, RouteProps } from './props'
import { selectCurrentDb, selectDbInfo, selectBank, selectBankAccounts, selectAccount } from './selectors'
import { Values, AccountForm, SubmitFunction } from './accountForm'

const messages = defineMessages({
  page: {
    id: 'acUpdate.page',
    defaultMessage: 'Edit'
  }
})

interface ConnectedProps {
  current: CurrentDb
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  accounts: Account.Doc[]
  account?: Account.Doc
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = IntlProps & EnhancedProps & ConnectedProps & RouteProps<Account.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: selectCurrentDb(state),
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      accounts: selectBankAccounts(state, props),
      account: selectAccount(state, props)
    })
  ),
  withProps(({router}: AllProps): EnhancedProps => ({
    onCancel: () => {
      router.goBack()
    },
    onSubmit: async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
      const { current } = props
      const account = props.account!

      const doc: Account.Doc = {
        ...account,
        ...values
      }

      await current!.db.put(doc)

      router.replace(Account.to.view(doc))
    }
  }))
)

export const AccountEdit = enhance((props: AllProps) => {
  const { bank, account, accounts, onSubmit, onCancel } = props
  const { formatMessage } = props.intl
  return (
    <div>
      {bank && account &&
        <Grid>
          <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
          <AccountForm {...props} account={account} accounts={accounts} onSubmit={onSubmit} onCancel={onCancel}/>
        </Grid>
      }
    </div>
  )
})
