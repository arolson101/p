import * as React from 'react'
import { Button, PageHeader } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withState, withHandlers } from 'recompose'
import { Bank, Account } from '../../docs/index'
import { AppState } from '../../state/index'
import { Favico } from './forms/Favico'
import { selectBanks } from './selectors'
import { BankDialog } from './BankDialog'

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

interface State {
  showCreate: boolean
  setShowCreate: (showCreate: boolean) => void
}

interface Handlers {
  toggleCreate: () => void
}

type EnhancedProps = React.Props<any> & ConnectedProps & State & Handlers

const enhance = compose<EnhancedProps, void>(
  setDisplayName('Accounts'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      banks: selectBanks(state)
    })
  ),
  withState('showCreate', 'setShowCreate', false),
  withHandlers({
    toggleCreate: ({setShowCreate, showCreate}) => () => {
      setShowCreate(!showCreate)
    }
  })
)

export const Accounts = enhance(props => {
  const { banks, toggleCreate, showCreate } = props

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
      <Button onClick={toggleCreate}>add institution</Button>
      <BankDialog show={showCreate} onHide={toggleCreate}/>
      {/*<Link to={Bank.to.create()}>add institution</Link><br/>*/}
    </div>
  )
})
