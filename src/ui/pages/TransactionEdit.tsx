import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link, RouteComponentProps } from 'react-router-dom'
import { compose } from 'redux'
import { Bank, Account, Transaction } from '../../docs/index'
import { AppState } from '../../state/index'
import { selectBank, selectAccount, selectTransaction } from '../../selectors'
import { TransactionDetail } from '../components/TransactionDetail'

type RouteProps = RouteComponentProps<Transaction.Params>

interface ConnectedProps {
  bank: Bank.View
  account: Account.Doc
  transaction: Transaction.Doc
}

type EnhancedProps = RouteProps & ConnectedProps

const enhance = compose(
  connect(
    (state: AppState, props: RouteProps): ConnectedProps => ({
      bank: selectBank(state, props)!,
      account: selectAccount(state, props)!,
      transaction: selectTransaction(state, props)!,
    })
  )
)

export const TransactionEdit = enhance(props => {
  const { transaction } = props
  return (
    <div>
      <PageHeader>
        {transaction.name}
      </PageHeader>
      <div>
        serverid: {transaction.serverid}<br/>
        name: {transaction.name}<br/>
        memo: {transaction.memo}<br/>
        amount: {transaction.amount}<br/>
      </div>
    </div>
  )
})
