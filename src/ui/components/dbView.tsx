import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Lookup } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'
import { DbLogin } from './dbLogin'
import { selectDbInfo } from './selectors'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  current?: CurrentDb
}

type AllProps = React.Props<any> & ConnectedProps & RouteProps<DbInfo.Params>

export const DbViewComponent = (props: AllProps) => {
  if (!props.current || props.current.info._id !== DbInfo.docId({db: props.params.db})) {
    return <DbLogin {...props}/>
  }

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
      <Link to={Bank.to.create()}>add institution</Link>
    </Grid>
  )
}

export const DbView = connect(
  (state: AppState, props: RouteProps<DbInfo.Params>): ConnectedProps => ({
    dbInfo: selectDbInfo(state),
    current: state.db.current
  })
)(DbViewComponent as any) as React.ComponentClass<{}>
