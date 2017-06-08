import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose } from 'redux'
import { Bank, Account, Transaction } from '../../docs/index'
import { AppState } from '../../state/index'
import { RouteProps } from './props'
import { selectBank, selectAccount, selectTransaction } from './selectors'
import { TransactionDetail } from './TransactionDetail'

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
  transaction: Transaction.View
}

type EnhancedProps = RouteProps<Transaction.Params> & ConnectedProps

const enhance = compose(
  connect(
    (state: AppState, props: RouteProps<Transaction.Params>): ConnectedProps => ({
      bank: selectBank(state, props),
      account: selectAccount(state, props),
      transaction: selectTransaction(state, props),
    })
  )
)

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
