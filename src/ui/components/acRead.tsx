import * as React from 'react'
import Loading from 'react-loading-bar'
import { Grid } from 'react-bootstrap'
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
      <Loading color='red' show={!account || !institution}/>
      {account && institution &&
        <Grid>
          <Breadcrumbs {...props}/>
          <h1>{institution.name}</h1>
          <h2>{account.name}</h2>
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
