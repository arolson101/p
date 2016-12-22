import * as React from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Grid, PageHeader, ButtonGroup, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Link } from 'react-router'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps, IntlProps } from './props'
import { selectDbInfo, selectInstitution, selectInstitutionAccounts } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inAccounts.page',
    defaultMessage: 'Accounts'
  }
})

interface Props {}

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  institution?: Institution.Doc
  accounts?: Account.Doc[]
}

type AllProps = Props & RouteProps<Institution.Params> & ConnectedProps & IntlProps

export const InAccountsComponent = (props: AllProps) => {
  const { institution, accounts, router } = props
  const { formatMessage } = props.intl
  return (
    <div>
      {institution &&
        <Grid>
          <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
          <PageHeader>{institution.name}</PageHeader>
          <ButtonGroup>
            <Button bsSize='small' onClick={() => alert('sync')}>sync accounts</Button>
            <Button bsSize='small' href={router.createHref(Institution.to.accountCreate(institution))}>add account</Button>
          </ButtonGroup>
          {accounts && accounts.length > 0 &&
            <ul>
              {accounts.map(account => account &&
                <li key={account._id}>
                  <Link to={Account.to.read(account)}>
                    <i className={Account.icons[account.type]}/>
                    {' '}
                    {account.name}
                  </Link>
                </li>
              )}
            </ul>
          }
        </Grid>
      }
    </div>
  )
}

export const InAccounts = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Institution.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      institution: selectInstitution(state, props),
      accounts: selectInstitutionAccounts(state, props)
    })
  )
)(InAccountsComponent) as React.ComponentClass<Props>
