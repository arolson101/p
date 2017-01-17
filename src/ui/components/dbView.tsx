import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { DbInfo, Bank, Account, Bill } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Lookup } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'
import { selectDbInfo, selectCurrentDb } from './selectors'

interface ConnectedProps {
  dbInfo: DbInfo.Doc
  current: CurrentDb
}

type AllProps = React.Props<any> & ConnectedProps & RouteProps<DbInfo.Params>

export const DbViewComponent = (props: AllProps) => {
  const { banks, accounts } = props.current.cache

  return (
    <Grid>
      <Breadcrumbs {...props}/>
      institutions:
      <ul>
        {Lookup.map(banks, bank =>
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
      <Link to={Bill.to.all()}>bills</Link>
    </Grid>
  )
}

export const DbView = connect(
  (state: AppState, props: RouteProps<DbInfo.Params>): ConnectedProps => ({
    dbInfo: selectDbInfo(state),
    current: selectCurrentDb(state)
  })
)(DbViewComponent as any) as React.ComponentClass<{}>
