import * as React from 'react'
import { Link } from 'react-router'
import { createSelector } from 'reselect'
import { AppState, OpenDb, Institution, Account } from '../../modules'
import { promisedConnect, Promised } from '../../util'

interface Props {
}

interface ConnectedProps {
}

interface RouteProps {
  params: {
    db: string
  }
}

interface AsyncProps {
  institutions?: InstitutionWithAccounts[]
}

type AllProps = React.Props<any> & Props & ConnectedProps & RouteProps & AsyncProps

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
        {props.institutions.map(institution =>
          <li key={institution._id}>
            <Link to={Institution.path(db, institution)}>{institution.name}</Link>
            <ul>
              {institution.accounts.map(account =>
                <li key={account._id}><Link to={Account.path(db, account)}>{account.name}</Link></li>
              )}
              <li><Link to={Institution.path(db, institution, 'create')}>add account</Link></li>
            </ul>
          </li>
        )}
      </ul>
      <Link to={`/${db}/create`}>add institution</Link>
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

const queryInstitutions = createSelector(
  (state: AppState) => state.db.current,
  async (current): Promise<InstitutionWithAccounts[] | undefined> => {
    if (current) {
      const iresults = await current.handle.find({selector: Institution.all})
      const institutions: InstitutionWithAccounts[] = iresults.docs
      for (let institution of institutions) {
        const aresults = await current.handle.find({selector: Account.allForInstitution(institution)})
        institution.accounts = aresults.docs
      }
      return institutions
    }
  }
)

export const DbView = promisedConnect(
  (state: AppState, props: RouteProps): ConnectedProps & Promised<AsyncProps> => ({
    institutions: queryInstitutions(state, props)
  })
)(DbViewComponent as any) as React.ComponentClass<Props>
