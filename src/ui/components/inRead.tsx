import * as React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
import { Grid, PageHeader, ButtonGroup, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'
import { selectDbInfo, selectInstitution } from './selectors'

export const messages = defineMessages({
  noAccounts: {
    id: 'inRead.noAccounts',
    defaultMessage: 'No Accounts'
  }
})

interface Props {}

interface ConnectedProps {
  institution?: Institution.Doc
  dbInfo?: DbInfo.Doc
  accounts?: Account.Cache
}

type AllProps = Props & RouteProps<Institution.Params> & ConnectedProps

export const InReadComponent = (props: AllProps) => {
  const { institution, router } = props
  const accounts = props.accounts!
  return (
    <div>
      {institution &&
        <Grid>
          <Breadcrumbs {...props}/>
          <PageHeader>{institution.name}</PageHeader>
          <ButtonGroup className='pull-right'>
            <Button bsSize='small' href={router.createHref(Institution.to.accountCreate(institution))}>add account</Button>
            <Button bsSize='small' href={router.createHref(Institution.to.update(institution))}>update</Button>
            <Button bsSize='small' href={router.createHref(Institution.to.del(institution))}>delete</Button>
          </ButtonGroup>
          {institution.accounts.length > 0 ? (
            <ul>
              {institution.accounts.map(id => accounts.get(id)).map(account => account &&
                <li key={account._id}>
                  <Link to={Account.to.read(account)}>
                    <i className={Account.icons[account.type]}/>
                    {' '}
                    {account.name}
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <FormattedMessage {...messages.noAccounts}/>
          )}
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
