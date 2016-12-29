import autobind = require('autobind-decorator')
import * as React from 'react'
import { Table, Button, Grid, PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { makeCancelable, CancelablePromise } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { typedFields } from './forms'
import { RouteProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
  current: CurrentDb
}

type AllProps = RouteProps<Account.Params> & ConnectedProps & ReduxFormProps<Values>

interface State {
  transactions?: Transaction[]
}

interface Values {
  date: string
  payee: string
  amount: string
}

const { TextField } = typedFields<Values>()

export class AccountViewComponent extends React.Component<AllProps, State> {
  state: State = {
    transactions: undefined
  }

  loadTransactionsPromise?: CancelablePromise<any> = undefined

  componentDidMount() {
    this.loadTransactions(this.props)
  }

  componentWillReceiveProps(nextProps: AllProps) {
    this.loadTransactions(nextProps)
  }

  componentWillUnmount() {
    if (this.loadTransactionsPromise) {
      this.loadTransactionsPromise.cancel()
    }
  }

  async loadTransactions(props: AllProps) {
    if (props.current && props.account) {
      const results = await props.current.db.find({selector: Transaction.allForAccount(props.account)})
      this.setState({transactions: results.docs})
    }
  }

  render() {
    const { bank, account } = this.props
    const { transactions } = this.state
    return (
      <div>
        {account && bank &&
          <Grid>
            <Breadcrumbs {...this.props}/>
            <PageHeader>
              {account.name}
              {' '}
              <small>{account.number}</small>
            </PageHeader>
            <Table>
              <thead>
                <tr>
                  <th>date</th>
                  <th>payee</th>
                  <th>amount</th>
                  <th>balance</th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.map(tx =>
                  <tr key={tx.time.valueOf()}>
                    <td>{tx.time.toString()}</td>
                    <td>{tx.payee}</td>
                    <td>{tx.amount}</td>
                    <td>?</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div><Button onClick={this.addTransaction}>add transaction</Button></div>
            <div><Link to={Account.to.edit(account)}>update</Link></div>
            <div><Link to={Account.to.del(account)}>delete</Link></div>
          </Grid>
        }
      </div>
    )
  }

  @autobind
  async addTransaction() {
    const { current, account } = this.props
    const txs: Transaction.Doc[] = []
    for (let i = 0; i < 5; i++) {
      const tx: Transaction = {
        time: new Date(2016, 11, i, Math.trunc(Math.random() * 24), Math.trunc(Math.random() * 60)),
        payee: 'payee ' + i + ' ' + Math.random() * 100,
        amount: (Math.random() - 0.5) * 1000,
        split: {}
      }
      const doc = Transaction.doc(account!, tx)
      txs.push(doc)
    }

    current.db.bulkDocs(txs)
  }
}

export const AccountView = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      account: selectAccount(state, props),
      current: state.db.current!
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'AccountView'
  })
)(AccountViewComponent) as React.ComponentClass<{}>
