import * as React from 'react'
import Loading from 'react-loading-bar'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Institution, Account } from '../../docs'
import { AppState } from '../../state'
import { RouteProps } from './props'
import { selectInstitution, selectAccount } from './selectors'

interface Props {}

interface ConnectedProps {
  institution?: Institution.Doc
  account?: Account.Doc
}

type AllProps = Props & RouteProps<Account.Params> & ConnectedProps

export const AcReadComponent = (props: AllProps) => {
  const { institution, account } = props
  return (
    <div>
      <Loading color='red' show={!account || !institution}/>
      {account && institution &&
        <div>
          <h1><Link to={Institution.to.read(institution)}>{institution.name}</Link></h1>
          <h2>{account.name}</h2>
        </div>
      }
    </div>
  )
}

export const AcRead = connect(
  (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
    institution: selectInstitution(state, props),
    account: selectAccount(state, props)
  })
)(AcReadComponent) as React.ComponentClass<Props>
