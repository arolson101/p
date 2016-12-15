import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'
import { selectDbInfo, selectInstitution } from './selectors'

interface Props {}

interface ConnectedProps {
  institution?: Institution.Doc
  dbInfo?: DbInfo.Doc
  accounts?: Account.Cache
}

type AllProps = Props & RouteProps<Institution.Params> & ConnectedProps

export const InReadComponent = (props: AllProps) => {
  const { institution } = props
  const accounts = props.accounts!
  return (
    <div>
      {institution &&
        <Grid>
          <Breadcrumbs {...props}/>
          <PageHeader>{institution.name}</PageHeader>
          <ul>
            {institution.accounts.map(id => accounts.get(id)).map(account => account &&
              <li key={account._id}><Link to={Account.to.read(account)}>{account.name}</Link></li>
            )}
          </ul>
          <p><Link to={Institution.to.accountCreate(institution)}>add account</Link></p>
          <p><Link to={Institution.to.update(institution)}>update</Link></p>
          <p><Link to={Institution.to.del(institution)}>delete</Link></p>
        </Grid>
      }
    </div>
  )
}

export const InRead = connect(
  (state: AppState, props: RouteProps<Institution.Params>): ConnectedProps => ({
    dbInfo: selectDbInfo(state),
    institution: selectInstitution(state, props),
    accounts: state.db.current && state.db.current.cache.accounts!
  })
)(InReadComponent) as React.ComponentClass<Props>
