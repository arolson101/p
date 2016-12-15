import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'
import { selectDbInfo, selectInstitution, selectAccount } from './selectors'

interface Props {}

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  institution?: Institution.Doc
  account?: Account.Doc
}

type AllProps = Props & RouteProps<Account.Params> & ConnectedProps

export const AcReadComponent = (props: AllProps) => {
  const { institution, account } = props
  return (
    <div>
      {account && institution &&
        <Grid>
          <Breadcrumbs {...props}/>
          <PageHeader>
            <i className={Account.icons[account.type]}/>
            {' '}
            {account.name}
            {' '}
            <small>{account.number}</small>
          </PageHeader>
          <div><Link to={Account.to.update(account)}>update</Link></div>
          <div><Link to={Account.to.del(account)}>delete</Link></div>
        </Grid>
      }
    </div>
  )
}

export const AcRead = connect(
  (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
    dbInfo: selectDbInfo(state),
    institution: selectInstitution(state, props),
    account: selectAccount(state, props)
  })
)(AcReadComponent) as React.ComponentClass<Props>
