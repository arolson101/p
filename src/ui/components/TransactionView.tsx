import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
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

export class TransactionViewComponent extends React.Component<EnhancedProps, any> {
  render () {
    const { transaction } = this.props
    return (
      <div>
        <PageHeader>
          {transaction.doc.name}
        </PageHeader>
        <TransactionDetail item={transaction}/>
      </div>
    )
  }
}

export const TransactionView = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Transaction.Params>): ConnectedProps => ({
      bank: selectBank(state, props),
      account: selectAccount(state, props),
      transaction: selectTransaction(state, props),
    })
  )
)(TransactionViewComponent) as React.ComponentClass<void>
