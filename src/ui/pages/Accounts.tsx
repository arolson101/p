import * as React from 'react'
import { Button, PageHeader } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withState, withHandlers } from 'recompose'
import { Bank, Account } from 'core/docs'
import { AppState, mapDispatchToProps } from 'core/state'
import { Favico } from '../components/Favico'
import { selectBank, selectBanks, selectAccount } from 'core/selectors'
import { showBankDialog } from '../dialogs'

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
          <BankListItem key={bank.doc._id} bank={bank}/>
        )}
      </ul>
      <Button onClick={createBank}>add institution</Button>
      {/*<Link to={Bank.to.create()}>add institution</Link><br/>*/}
    </div>
  )
})

const BankListItem = (props: { bank: Bank.View }) => {
  const { bank } = props
  return (
    <li key={bank.doc._id}>
      <Favico value={bank.doc.favicon}/>
      {' '}
      <Link to={Bank.to.view(bank.doc)}>
        {bank.doc.name}
      </Link>
      <ul>
        {bank.doc.accounts.map(accountId =>
          <AccountListItem key={accountId} accountId={accountId}/>
        )}
      </ul>
    </li>
  )
}

const AccountListItem = connect(
  (state: AppState, props: { accountId: Account.DocId }) => ({
    account: selectAccount(state, props.accountId)!
  })
)(props => {
  const { account } = props
  if (!account) {
    return null
  }
  return (
    <li key={account.doc._id}>
      <Link to={Account.to.view(account.doc)}>{account.doc.name}</Link>
    </li>
  )
})
