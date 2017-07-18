import * as React from 'react'
import { Button, PageHeader } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withState, withHandlers } from 'recompose'
import { Bank, Account } from '../../docs/index'
import { AppState, mapDispatchToProps } from '../../state/index'
import { Favico } from '../components/Favico'
import { selectBank, selectBanks, selectAccount } from '../../selectors'
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
  banks: Bank.Doc[]
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
          <BankListItem key={bank._id} bank={bank}/>
        )}
      </ul>
      <Button onClick={createBank}>add institution</Button>
      {/*<Link to={Bank.to.create()}>add institution</Link><br/>*/}
    </div>
  )
})

const BankListItem = (props: { bank: Bank.Doc }) => {
  const { bank } = props
  return (
    <li key={bank._id}>
      <Favico value={bank.favicon}/>
      {' '}
      <Link to={Bank.to.view(bank)}>
        {bank.name}
      </Link>
      <ul>
        {bank.accounts.map(accountId =>
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
    <li key={account._id}>
      <Link to={Account.to.view(account)}>{account.name}</Link>
    </li>
  )
})