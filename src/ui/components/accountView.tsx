import autobind = require('autobind-decorator')
import * as React from 'react'
import { Table, Button, Grid, PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { getTransactions } from '../../actions'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { CancelablePromise } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps, DispatchProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
  current: CurrentDb
}

type AllProps = RouteProps<Account.Params> & ConnectedProps & DispatchProps & ReduxFormProps<Values>

interface State {
  transactions?: PouchDB.Core.AllDocsResponse<Transaction>
}

interface Values {
  date: string
  payee: string
  amount: string
}

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
      const startkey = Transaction.startkeyForAccount(props.account)
      const endkey = Transaction.endkeyForAccount(props.account)
      // const skip = 4000
      // const limit = 100
      const results = await props.current.db.allDocs({startkey, endkey, include_docs: true})
      this.setState({transactions: results})
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
                {transactions && transactions.rows.map(row =>
                  <tr key={row.doc!._id}>
                    <td>{row.doc!.time.toString()}</td>
                    <td>{row.doc!.payee}</td>
                    <td>{row.doc!.amount}</td>
                    <td>?</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div><Button onClick={this.downloadTransactions}>download transactions</Button></div>
            <div><Button onClick={this.addTransaction}>create transactions</Button></div>
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
    for (let i = 0; i < 1000; i++) {
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
    this.loadTransactions(this.props)
  }

  @autobind
  async downloadTransactions() {
    const { dispatch, bank, account } = this.props
    dispatch(getTransactions(bank!, account!, new Date(2016, 11, 1), new Date(2016, 11, 30), (str) => str.defaultMessage!))
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
