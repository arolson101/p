import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose } from 'recompose'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Lookup } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps, IntlProps } from './props'
import { selectDbInfo, selectCurrentDb } from './selectors'

const messages = defineMessages({
  page: {
    id: 'Accounts.page',
    defaultMessage: 'Accounts'
  },
  newDbDescription: {
    id: 'login.newDbDescription',
    defaultMessage: 'Create a new data store'
  }
})

interface ConnectedProps {
  dbInfo: DbInfo.Doc
  current: CurrentDb
  banks?: Bank.Cache
  accounts?: Account.Cache
}

type AllProps = IntlProps & React.Props<any> & ConnectedProps & RouteProps<any>

const enhance = compose<AllProps, {}>(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      current: selectCurrentDb(state),
      banks: state.db.current && state.db.current.cache.banks,
      accounts: state.db.current && state.db.current.cache.accounts
  }))
)

export const Accounts = enhance((props) => {
  const { banks, accounts } = props

  return (
    <Grid>
      <Breadcrumbs {...props} page={messages.page}/>
      <PageHeader>
        Accounts
      </PageHeader>
      <ul>
        {banks && accounts && Lookup.map(banks, bank =>
          <li key={bank._id}>
            <Link to={Bank.to.view(bank)}>{bank.name}</Link>
            <ul>
              {bank.accounts.map(id => accounts.get(id)).map(account => account &&
                <li key={account._id}><Link to={Account.to.view(account)}>{account.name}</Link></li>
              )}
            </ul>
          </li>
        )}
      </ul>
      <Link to={Bank.to.create()}>add institution</Link><br/>
    </Grid>
  )
})
