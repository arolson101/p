import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { CancelablePromise } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps, DispatchProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'
import { TransactionDetail } from './transactionDetail'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
  current: CurrentDb
}

type AllProps = RouteProps<Transaction.Params> & ConnectedProps & DispatchProps

interface State {
  transaction?: Transaction.Doc
}

export class TransactionViewComponent extends React.Component<AllProps, State> {
  state: State = {
    transaction: undefined
  }

  loadTransactionPromise?: CancelablePromise<any> = undefined

  componentDidMount() {
    this.loadTransaction(this.props)
  }

  componentWillReceiveProps(nextProps: AllProps) {
    this.loadTransaction(nextProps)
  }

  componentWillUnmount() {
    if (this.loadTransactionPromise) {
      this.loadTransactionPromise.cancel()
    }
  }

  async loadTransaction(props: AllProps) {
    if (props.current) {
      const docId = Transaction.docId(props.params)
      const transaction: Transaction.Doc = await props.current.db.get(docId)
      this.setState({transaction})
    }
  }

  render() {
    const { bank, account } = this.props
    const { transaction } = this.state
    return (
      <div>
        {account && bank && transaction &&
          <Grid>
            <Breadcrumbs {...this.props} {...this.state}/>
            <PageHeader>
              {transaction.name}
            </PageHeader>
            <TransactionDetail {...this.props} item={transaction}/>
          </Grid>
        }
      </div>
    )
  }
}

export const TransactionView = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Transaction.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      account: selectAccount(state, props),
      current: state.db.current!
    })
  )
)(TransactionViewComponent) as React.ComponentClass<{}>
