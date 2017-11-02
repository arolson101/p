import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { compose } from 'recompose'
import { Bank, Account, Transaction } from 'core/docs'
import { AppState } from 'core/state'
import { selectBank, selectAccount, selectTransaction } from 'core/selectors'
import { TransactionDetail } from '../components/TransactionDetail'

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
  injectIntl,
)

export const TransactionViewComponent = enhance(props => {
  const { transaction } = props
  return (
    <div>
      <PageHeader>
        {transaction.doc.name}
      </PageHeader>
      <TransactionDetail item={transaction}/>
    </div>
  )
})

export const TransactionView = connect<StateProps, {}, Props>(
  (state: AppState, props): StateProps => ({
    bank: selectBank(state, props.bankId)!,
    account: selectAccount(state, props.accountId)!,
    transaction: selectTransaction(state, props.transactionId)!,
  })
)(TransactionViewComponent)

export const TransactionViewRoute = (props: RouteComponentProps<Transaction.Params>) =>
  <TransactionView
    bankId={Bank.docId(props.match.params)}
    accountId={Account.docId(props.match.params)}
    transactionId={Transaction.docId(props.match.params)}
  />
