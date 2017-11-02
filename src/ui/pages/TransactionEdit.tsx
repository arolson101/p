import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import { compose } from 'recompose'
import { Bank, Account, Transaction } from 'core/docs'
import { AppState } from 'core/state'
import { selectBank, selectAccount, selectTransaction } from 'core/selectors'

type RouteProps = RouteComponentProps<Transaction.Params>

interface Props {
  bankId: Bank.DocId
  accountId: Account.DocId
  transactionId: Transaction.DocId
}

interface StateProps {
  bank: Bank.View
  account: Account.View
  transaction: Transaction.View
}

type ConnectedProps = StateProps & Props
type EnhancedProps = RouteProps & ConnectedProps

const enhance = compose<EnhancedProps, ConnectedProps>(
)

export const TransactionEditComponent = enhance(props => {
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

export const TransactionEdit = connect<StateProps, void, Props>(
  (state: AppState, props): StateProps => ({
    bank: selectBank(state, props && props.bankId)!,
    account: selectAccount(state, props && props.accountId)!,
    transaction: selectTransaction(state, props && props.transactionId)!,
  })
)(TransactionEditComponent)

export const TransactionEditRoute = (props: RouteComponentProps<Transaction.Params>) =>
  <TransactionEdit
    bankId={Bank.docId(props.match.params)}
    accountId={Account.docId(props.match.params)}
    transactionId={Transaction.docId(props.match.params)}
  />
