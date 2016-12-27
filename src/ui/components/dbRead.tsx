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

interface Props {
}

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  current?: CurrentDb
}

type AllProps = React.Props<any> & Props & ConnectedProps & RouteProps<DbInfo.Params>

export const DbReadComponent = (props: AllProps) => {
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
            <Link to={Bank.to.read(bank)}>{bank.name}</Link>
            <ul>
              {bank.accounts.map(id => accounts.get(id)).map(account => account &&
                <li key={account._id}><Link to={Account.to.read(account)}>{account.name}</Link></li>
              )}
            </ul>
          </li>
        )}
      </ul>
      <Link to={Bank.to.create()}>add bank</Link>
    </Grid>
  )
}

export const DbRead = connect(
  (state: AppState, props: RouteProps<DbInfo.Params>): ConnectedProps => ({
    dbInfo: selectDbInfo(state),
    current: state.db.current
  })
)(DbReadComponent as any) as React.ComponentClass<Props>
