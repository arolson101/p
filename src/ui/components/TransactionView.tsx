import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { RouteProps, DispatchProps } from './props'
import { selectBank, selectAccount } from './selectors'
import { TransactionDetail } from './TransactionDetail'

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
  current: CurrentDb
}

type AllProps = RouteProps<Transaction.Params> & ConnectedProps & DispatchProps

interface State {
  transaction: Transaction.Doc
}

export class TransactionViewComponent extends React.Component<AllProps, State> {
  render() {
    const { transaction } = this.state
    return (
      <div>
        <Grid>
          <Breadcrumbs {...this.props} {...this.state}/>
          <PageHeader>
            {transaction.name}
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
      current: state.db.current!
    })
  )
)(TransactionViewComponent) as React.ComponentClass<{}>
