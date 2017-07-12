import * as React from 'react'
import { Button, PageHeader } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withState, withHandlers } from 'recompose'
import { Bank, Account } from '../../docs/index'
import { AppState, mapDispatchToProps } from '../../state/index'
import { Favico } from '../components/Favico'
import { selectBanks } from '../../selectors'
import { showBankDialog } from '../dialogs/index'

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

interface DispatchProps {
  showBankDialog: typeof showBankDialog
}

interface Handlers {
  createBank: () => void
}

type EnhancedProps = React.Props<any> & ConnectedProps & Handlers

const enhance = compose<EnhancedProps, undefined>(
  setDisplayName('Accounts'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, DispatchProps, {}>(
    (state: AppState): ConnectedProps => ({
      banks: selectBanks(state)
    }),
    mapDispatchToProps<DispatchProps>({ showBankDialog })
  ),
  withHandlers({
    createBank: ({ showBankDialog }) => () => {
      showBankDialog({})
    }
  })
)

export const Accounts = enhance(props => {
  const { banks, createBank } = props

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
                <li key={account._id}>
                  <Link to={Account.to.view(account)}>{account.name}</Link>
                </li>
              )}
            </ul>
          </li>
        )}
      </ul>
      <Button onClick={createBank}>add institution</Button>
      {/*<Link to={Bank.to.create()}>add institution</Link><br/>*/}
    </div>
  )
})
