import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank, Account } from '../../docs'
import { AppState } from '../../state'
import { Favico } from './forms/Favico'
import { RouteProps } from './props'
import { selectBanks } from './selectors'

const messages = defineMessages({
  page: {
    id: 'Accounts.page',
    defaultMessage: 'Accounts'
  },
  newDbDescription: {
    id: 'login.newDbDescription',
    defaultMessage: 'Create a new data store'
  }
})

interface ConnectedProps {
  banks: Bank.View[]
}

type AllProps = React.Props<any> & ConnectedProps & RouteProps<any>

const enhance = compose<AllProps, {}>(
  setDisplayName('Accounts'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      banks: selectBanks(state)
    })
  )
)

export const Accounts = enhance(props => {
  const { banks } = props

  return (
    <div>
      <PageHeader>
        <FormattedMessage {...messages.page}/>
      </PageHeader>
      <ul>
        {banks.map(bank =>
          <li key={bank.doc._id}>
            <Favico value={bank.doc.favicon}/>
            {' '}
            <Link to={Bank.to.view(bank.doc)}>
              {bank.doc.name}
            </Link>
            <ul>
              {bank.accounts.map(account =>
                <li key={account.doc._id}>
                  <Link to={Account.to.view(account.doc)}>{account.doc.name}</Link>
                </li>
              )}
            </ul>
          </li>
        )}
      </ul>
      <Link to={Bank.to.create()}>add institution</Link><br/>
    </div>
  )
})
