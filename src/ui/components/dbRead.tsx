import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Lookup } from '../../util'
import { RouteProps } from './props'
import { DbLogin } from './dbLogin'

interface Props {
}

interface ConnectedProps {
  current?: CurrentDb
}

type AllProps = React.Props<any> & Props & ConnectedProps & RouteProps<DbInfo.Params>

type InstitutionWithAccounts = Institution.Doc & {
  accounts: Account.Doc[]
}

export const DbReadComponent = (props: AllProps) => {
  if (!props.current || props.current.info._id !== DbInfo.docId({db: props.params.db})) {
    return <DbLogin {...props}/>
  }

  const { institutions, accounts } = props.current.cache

  return (
    <div>institutions:
      <ul>
        {Lookup.map(institutions, institution =>
          <li key={institution._id}>
            <Link to={Institution.path(institution)}>{institution.name}</Link>
            <ul>
              {institution.accounts.map(id => accounts.get(id)!).map(account =>
                <li key={account._id}><Link to={Account.path(account)}>{account.name}</Link></li>
              )}
            </ul>
          </li>
        )}
      </ul>
      <Link to={'/' + Institution.create}>add institution</Link>
    </div>
  )
}

export const DbRead = connect(
  (state: AppState, props: RouteProps<DbInfo.Params>): ConnectedProps => ({
    current: state.db.current
  })
)(DbReadComponent as any) as React.ComponentClass<Props>