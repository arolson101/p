import autobind = require('autobind-decorator')
import * as React from 'react'
import { Button, Grid, PageHeader } from 'react-bootstrap'
import { injectIntl, FormattedDate, FormattedNumber } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { AutoSizer, Table, Column } from 'react-virtualized'
import 'react-virtualized/styles.css'
import { getTransactions, deleteTransactions } from '../../actions'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb, ResponsiveState } from '../../state'
import { CancelablePromise } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps, DispatchProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'
import { Container, Item } from './flex'
import { TransactionDetail } from './transactionDetail'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
  current: CurrentDb
  browser: ResponsiveState
}

type AllProps = RouteProps<Account.Params> & ConnectedProps & DispatchProps & ReduxFormProps<Values>

interface State {
  transactions?: PouchDB.Core.AllDocsResponse<Transaction>
  selection?: number
}

interface Values {
  date: string
  payee: string
  amount: string
}

export class AccountViewComponent extends React.Component<AllProps, State> {
  state: State = {
    transactions: undefined,
    selection: undefined
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
    const { bank, account, browser } = this.props
    const { transactions, selection } = this.state
    const sideBySide = browser.greaterThan.small
    const listMaxWidth = sideBySide ? browser.breakpoints.extraSmall : Infinity
    const transaction = transactions && (selection !== undefined) && transactions.rows[selection].doc as Transaction.Doc
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
            <Container>
              <Item flex={1} style={{height: 500, maxWidth: listMaxWidth}}>
                <AutoSizer>
                  {(props: AutoSizer.ChildrenProps) => (
                    <Container>
                      <Table
                        style={{flex: 1, maxWidth: listMaxWidth}}
                        headerHeight={20}
                        rowCount={transactions ? transactions.rows.length : 0}
                        rowHeight={50}
                        rowGetter={this.rowGetter}
                        rowClassName={this.rowClassName}
                        onRowClick={sideBySide ? this.onRowClickSetSelection : this.onRowClickHref}
                        {...props}
                      >
                        <Column
                          label='Date'
                          dataKey='time'
                          cellRenderer={this.dateCellRenderer}
                          width={100}
                        />
                        <Column
                          label='Name'
                          dataKey='name'
                          width={300}
                          flexGrow={1}
                          cellDataGetter={this.getTransaction}
                          cellRenderer={this.nameCellRenderer}
                        />
                        <Column
                          label='Amount'
                          dataKey='amount'
                          headerClassName='alignRight'
                          style={{textAlign: 'right'}}
                          cellRenderer={this.currencyCellRenderer}
                          width={100}
                        />
                      </Table>
                    </Container>
                  )}
                </AutoSizer>
              </Item>
              {sideBySide &&
                <Item flex={1}>
                  {transaction &&
                    <TransactionDetail {...this.props} transaction={transaction} />
                  }
                </Item>
              }
            </Container>
            <div><Button onClick={this.downloadTransactions}>download transactions</Button></div>
            <div><Button onClick={this.addTransaction}>create transactions</Button></div>
            <div><Button onClick={this.deleteTransactions}>delete transactions</Button></div>
            <div><Link to={Account.to.edit(account)}>update</Link></div>
            <div><Link to={Account.to.del(account)}>delete</Link></div>
          </Grid>
        }
      </div>
    )
  }

  @autobind
  rowClassName (props: { index: number }) {
    const { index } = props
    if (index < 0) {
      return 'headerRow'
    } else {
      return index % 2 === 0 ? 'evenRow' : 'oddRow'
    }
  }

  @autobind
  getTransaction(props: Column.CellDataGetterArgs) {
    const transaction = props.rowData as Transaction
    return transaction
  }

  @autobind
  nameCellRenderer(props: Column.CellRendererArgs) {
    const transaction = props.cellData as Transaction
    return <div>
      {transaction.name}<br/>
      <small>{transaction.memo}</small>
    </div>
  }

  @autobind
  dateCellRenderer(props: Column.CellRendererArgs) {
    return <FormattedDate value={props.cellData} />
  }

  @autobind
  currencyCellRenderer(props: Column.CellRendererArgs) {
    return <FormattedNumber value={props.cellData} style='currency' currency='USD' currencyDisplay='symbol' />
  }

  @autobind
  rowGetter(props: {index: number}): any {
    const { index } = props
    const { transactions } = this.state
    const transaction = transactions!.rows[index].doc as Transaction
    return transaction
  }

  @autobind
  onRowClickSetSelection(props: {index: number}) {
    this.setState({selection: props.index})
  }

  @autobind
  onRowClickHref(props: {index: number}) {
    const { index } = props
    const { transactions } = this.state
    const { router } = this.props
    const transaction = transactions && (index >= 0) && transactions.rows[index].doc as Transaction.Doc
    if (transaction) {
      const href = router.createHref(Transaction.to.view(transaction))
      router.push(Transaction.to.view(transaction))
    }
  }

  @autobind
  async addTransaction() {
    const { current, account } = this.props
    const txs: Transaction.Doc[] = []
    for (let i = 0; i < 1000; i++) {
      const tx: Transaction = {
        time: new Date(2016, 11, i, Math.trunc(Math.random() * 24), Math.trunc(Math.random() * 60)),
        name: 'payee ' + i + ' ' + Math.random() * 100,
        memo: '',
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
    await dispatch(getTransactions(bank!, account!, new Date(2016, 11, 1), new Date(2016, 11, 31), (str) => str.defaultMessage!))
    this.loadTransactions(this.props)
  }

  @autobind
  async deleteTransactions() {
    const { dispatch, account } = this.props
    await dispatch(deleteTransactions(account!))
    this.loadTransactions(this.props)
  }
}

export const AccountView = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      account: selectAccount(state, props),
      current: state.db.current!,
      browser: state.browser
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'AccountView'
  })
)(AccountViewComponent) as React.ComponentClass<{}>
