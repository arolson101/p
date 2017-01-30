import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { RouteProps, DispatchProps } from './props'
import { selectBank, selectAccount, selectTransaction } from './selectors'
import { TransactionDetail } from './TransactionDetail'

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
  current: CurrentDb
  transaction: Transaction.View
}

type AllProps = RouteProps<Transaction.Params> & ConnectedProps & DispatchProps

export class TransactionViewComponent extends React.Component<AllProps, any> {
  render() {
    const { transaction } = this.props
    return (
      <div>
        <Grid>
          <Breadcrumbs/>
          <PageHeader>
            {transaction.doc.name}
          </PageHeader>
          <TransactionDetail {...this.props} item={transaction}/>
        </Grid>
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
      current: state.db.current!
    })
  )
)(TransactionViewComponent) as React.ComponentClass<{}>
