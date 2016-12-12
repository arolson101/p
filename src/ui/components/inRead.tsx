import * as React from 'react'
import Loading from 'react-loading-bar'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Institution, Account } from '../../docs'
import { AppState } from '../../state'
import { RouteProps } from './props'
import { selectInstitution } from './selectors'

interface Props {}

interface ConnectedProps {
  institution?: Institution.Doc
  accounts?: Account.Cache
}

type AllProps = Props & RouteProps<Institution.Params> & ConnectedProps

export const InReadComponent = (props: AllProps) => {
  const { institution } = props
  const accounts = props.accounts!
  return (
    <div>
      <Loading color='red' show={!institution}/>
      {institution &&
        <div>
          <h1>{institution.name}</h1>
          <ul>
            {institution.accounts.map(id => accounts.get(id)!).map(account =>
              <li key={account._id}><Link to={Account.path(account)}>{account.name}</Link></li>
            )}
          </ul>
          <Link to={Institution.accountCreatePath(institution)}>add account</Link>
        </div>
      }
    </div>
  )
}

export const InRead = connect(
  (state: AppState, props: RouteProps<Institution.Params>): ConnectedProps => ({
    institution: selectInstitution(state, props),
    accounts: state.db.current && state.db.current.cache.accounts!
  })
)(InReadComponent) as React.ComponentClass<Props>
