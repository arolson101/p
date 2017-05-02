import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank, Account } from '../../docs/index'
import { AppState } from '../../state/index'
import { Favico } from './forms/Favico'
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

type AllProps = React.Props<any> & ConnectedProps

const enhance = compose<AllProps, void>(
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
