import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
}

type AllProps = RouteProps<Account.Params> & ConnectedProps

export const AccountViewComponent = (props: AllProps) => {
  const { bank, account } = props
  return (
    <div>
      {account && bank &&
        <Grid>
          <Breadcrumbs {...props}/>
          <PageHeader>
            {account.name}
            {' '}
            <small>{account.number}</small>
          </PageHeader>
          <div><Link to={Account.to.edit(account)}>update</Link></div>
          <div><Link to={Account.to.del(account)}>delete</Link></div>
        </Grid>
      }
    </div>
  )
}

export const AccountView = connect(
  (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
    dbInfo: selectDbInfo(state),
    bank: selectBank(state, props),
    account: selectAccount(state, props)
  })
)(AccountViewComponent) as React.ComponentClass<{}>
