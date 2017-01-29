import { Grid } from 'react-bootstrap'
import * as React from 'react'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Dispatch } from 'redux'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { RouteProps } from './props'
import { selectCurrentDb, selectDbInfo, selectBank, selectBankAccounts, selectAccount } from './selectors'
import { Values, AccountForm, SubmitFunction } from './AccountForm'

const messages = defineMessages({
  page: {
    id: 'acUpdate.page',
    defaultMessage: 'Edit'
  }
})

interface ConnectedProps {
  current: CurrentDb
  dbInfo?: DbInfo
  bank?: Bank.Doc
  accounts: Account.Doc[]
  account?: Account.Doc
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<Account.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
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
  return (
    <div>
      {bank && account &&
        <Grid>
          <Breadcrumbs {...props} page={messages.page}/>
          <AccountForm {...props} edit={account} accounts={accounts} onSubmit={onSubmit} onCancel={onCancel}/>
        </Grid>
      }
    </div>
  )
})
