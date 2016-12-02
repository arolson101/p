import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { createSelector } from 'reselect'
import { Institution, Account } from '../../docs'
import { AppState, OpenDb } from '../../state'
import { Lookup } from '../../util'

interface Props {
}

interface ConnectedProps {
  institutions: Institution.Cache
  accounts: Account.Cache
}

interface RouteProps {
  params: {
    db: string
  }
}

type AllProps = React.Props<any> & Props & ConnectedProps & RouteProps

type InstitutionWithAccounts = Institution.Doc & {
  accounts: Account.Doc[]
}

export const DbViewComponent = (props: AllProps) => {
  if (!props.institutions) {
    return <div>loading...</div>
  }
  const { db } = props.params

  return (
    <div>institutions:
      <ul>
        {Lookup.map(props.institutions, institution =>
          <li key={institution._id}>
            <Link to={Institution.path(db, institution)}>{institution.name}</Link>
            <ul>
              {Array.from(props.accounts.values())
                    .filter(account => account.institution === institution._id)
                    .map(account =>
                <li key={account._id}><Link to={Account.path(db, account)}>{account.name}</Link></li>
              )}
              <li><Link to={Institution.path(db, institution, 'create')}>add account</Link></li>
            </ul>
          </li>
        )}
      </ul>
      <Link to={`/${db}/?create`}>add institution</Link>
    </div>
  )
}

const addAccount = async (institution: InstitutionWithAccounts, current: OpenDb<any>) => {
  const account: Account = {
    name: 'Account ' + institution.accounts.length,
    institution: institution._id,
    type: Account.Type.CHECKING,
    number: institution.accounts.length.toString(),
    visible: true,
    balance: 0
  }
  current.handle.put(Account.doc(account))
}

const addInstitution = async (current: OpenDb<any>) => {
  current.handle.put(Institution.doc({name: '1st bank'}))
}

export const DbView = connect(
  (state: AppState, props: RouteProps): ConnectedProps => ({
    institutions: state.cache.institutions,
    accounts: state.cache.accounts
  })
)(DbViewComponent as any) as React.ComponentClass<Props>
