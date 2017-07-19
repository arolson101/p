import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link, RouteComponentProps } from 'react-router-dom'
import { compose } from 'recompose'
import { Bank, Account, Transaction } from '../../docs/index'
import { AppState } from '../../state/index'
import { selectBank, selectAccount, selectTransaction } from '../../selectors'
import { TransactionDetail } from '../components/TransactionDetail'

type RouteProps = RouteComponentProps<Transaction.Params>

interface Props {
  bankId: Bank.DocId
  accountId: Account.DocId
  transactionId: Transaction.DocId
}

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
  transaction: Transaction.View
}

type EnhancedProps = RouteProps & ConnectedProps & Props

const enhance = compose<EnhancedProps, Props>(
  connect<ConnectedProps, void, Props>(
    (state: AppState, props): ConnectedProps => ({
      bank: selectBank(state, props && props.bankId)!,
      account: selectAccount(state, props && props.accountId)!,
      transaction: selectTransaction(state, props && props.transactionId)!,
    })
  )
)

export const TransactionEditRoute = (props: RouteComponentProps<Transaction.Params>) =>
  <TransactionEdit
    bankId={Bank.docId(props.match.params)}
    accountId={Account.docId(props.match.params)}
    transactionId={Transaction.docId(props.match.params)}
  />

export const TransactionEdit = enhance(props => {
  const { transaction } = props
  return (
    <div>
      <PageHeader>
        {transaction.doc.name}
      </PageHeader>
      <div>
        serverid: {transaction.doc.serverid}<br/>
        name: {transaction.doc.name}<br/>
        memo: {transaction.doc.memo}<br/>
        amount: {transaction.doc.amount}<br/>
      </div>
    </div>
  )
})
