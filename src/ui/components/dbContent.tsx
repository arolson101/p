import * as React from 'react'
import { createSelector } from 'reselect'
import { AppState, OpenDb, Institution, Account } from '../../modules'
import { promisedConnect, Promised } from '../../util'
import { DbLogin } from './dbLogin'

interface Props {
}

interface ConnectedProps {
  current?: OpenDb<any>
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

export const DbContentComponent = (props: AllProps) => {
  if (!props.current || props.current._id !== props.params.db) {
    return <DbLogin {...props}/>
  }

  if (!props.institutions) {
    return <div>loading...</div>
  }

  return (
    <div>db is {props.params.db}
      <div>institutions:
        <ul>
          {props.institutions.map(institution =>
            <li key={institution._id}>
              {institution.name}
              <ul>
                {institution.accounts.map(account =>
                  <li key={account._id}>{account.name}</li>
                )}
                <li><button onClick={() => addAccount(institution, props.current!)}>add account</button></li>
              </ul>
            </li>
          )}
        </ul>
        <button onClick={() => addInstitution(props.current!)}>add institution</button>
      </div>
      {props.children}
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

export const DbContent = promisedConnect(
  (state: AppState, props: RouteProps): ConnectedProps & Promised<AsyncProps> => ({
    current: state.db.current,
    institutions: queryInstitutions(state, props)
  })
)(DbContentComponent as any) as React.ComponentClass<Props>
