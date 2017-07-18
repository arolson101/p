import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
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
  bank: Bank.Doc
  account: Account.Doc
  transaction: Transaction.Doc
}

type EnhancedProps = RouteProps & ConnectedProps & Props

const enhance = compose<EnhancedProps, Props>(
  injectIntl,
  connect<ConnectedProps, {}, Props>(
    (state: AppState, props): ConnectedProps => ({
      bank: selectBank(state, props && props.bankId)!,
      account: selectAccount(state, props && props.accountId)!,
      transaction: selectTransaction(state, props && props.transactionId)!,
    })
  )
)

export const TransactionViewRoute = (props: RouteComponentProps<Transaction.Params>) =>
  <TransactionView
    bankId={Bank.docId(props.match.params)}
    accountId={Account.docId(props.match.params)}
    transactionId={Transaction.docId(props.match.params)}
  />

export const TransactionView = enhance(props => {
  const { transaction } = props
  return (
    <div>
      <PageHeader>
        {transaction.name}
      </PageHeader>
      <TransactionDetail item={transaction}/>
    </div>
  )
})
