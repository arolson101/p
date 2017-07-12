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

interface ConnectedProps {
  bank: Bank.View
  account: Account.Doc
  transaction: Transaction.Doc
}

type EnhancedProps = RouteProps & ConnectedProps

const enhance = compose<EnhancedProps, undefined>(
  injectIntl,
  connect<ConnectedProps, {}, RouteProps>(
    (state: AppState, props: RouteProps): ConnectedProps => ({
      bank: selectBank(Bank.docId(props!.match.params))(state)!,
      account: selectAccount(Account.docId(props!.match.params))(state)!,
      transaction: selectTransaction(state, Transaction.docId(props!.match.params))!,
    })
  )
)

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
