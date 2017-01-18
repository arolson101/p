import * as React from 'react'
import { Button, Grid, PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { AutoSizer, Column } from 'react-virtualized'
import { compose, setDisplayName, withHandlers, withState, renderComponent } from 'recompose'
import { getTransactions, deleteTransactions } from '../../actions'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { Container, Item } from './flex'
import { RouteProps, DispatchProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'
import { TransactionDetail } from './transactionDetail'
import { withResolveProp } from '../enhancers'
import { ListWithDetails, getRowData, dateCellRenderer, currencyCellRenderer } from './ListWithDetails'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
  current: CurrentDb
}

type AllProps = RouteProps<Account.Params>
  & ConnectedProps
  & DispatchProps

interface PageState {
  scroll: number
  selection: number
}

interface Values {
  date: string
  payee: string
  amount: string
}

type EnhancedProps = AllProps & {
  transactions: Promise<Transaction.Doc[]>
  items: Transaction.Doc[]
  loadTransactions(): Promise<Transaction.Doc[]>
  setTransactions(promise: Promise<Transaction.Doc[]>): void
  addTransactions(): void
  downloadTransactions(): void
  deleteTransactions(): void
}

const SpinnerRender = () => <div>loading</div>
const ErrorRender = ({ transactions: error }: { transactions: Error }) => <div>error: {error.message}</div>

const enhance = compose<EnhancedProps, {}>(
  setDisplayName('AccountViewComponent'),
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      account: selectAccount(state, props),
      current: state.db.current!
    })
  ),
  withHandlers({
    loadTransactions: (props: AllProps) => async() => {
      if (props.current && props.account) {
        const startkey = Transaction.startkeyForAccount(props.account)
        const endkey = Transaction.endkeyForAccount(props.account)
        // const skip = 4000
        // const limit = 100
        const results = await props.current.db.allDocs({startkey, endkey, include_docs: true})
        const docs = results.rows.map(row => row.doc as Transaction.Doc)
        return docs
      }
    }
  }),
  withState('transactions', 'setTransactions', ({loadTransactions}: EnhancedProps) => loadTransactions()),
  withHandlers({
    addTransactions: (props: EnhancedProps) => async() => {
      const { current, account, setTransactions, loadTransactions } = props
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
      setTransactions(loadTransactions())
    },

    downloadTransactions: (props: EnhancedProps) => async () => {
      const { dispatch, bank, account, setTransactions, loadTransactions } = props
      await dispatch(getTransactions(bank!, account!, new Date(2016, 11, 1), new Date(2016, 11, 31), (str) => str.defaultMessage!))
      setTransactions(loadTransactions())
    },

    deleteTransactions: (props: EnhancedProps) => async() => {
      const { dispatch, account, setTransactions, loadTransactions } = props
      await dispatch(deleteTransactions(account!))
      setTransactions(loadTransactions())
    }
  }),
  withResolveProp(
    'transactions',
    'items',
    renderComponent(SpinnerRender),
    renderComponent(ErrorRender)
  )
)

export const AccountView = enhance((props) => {
  const { bank, account, items } = props
  const { downloadTransactions, addTransactions, deleteTransactions } = props
  return (
    <div>
      {account && bank &&
        <Grid>
          <Breadcrumbs {...props}/>
          <PageHeader>
            {account.name}
            {' '}
            <small>{account.number}</small>
          </PageHeader>
          <Container>
            <Item flex={1} style={{height: 500}}>
              <AutoSizer>
                {(autoSizerProps: AutoSizer.ChildrenProps) => (
                  <ListWithDetails
                    items={items}
                    {...autoSizerProps}
                    columns={[
                      {
                        label: 'Date',
                        dataKey: 'time',
                        cellRenderer: dateCellRenderer,
                        width: 100
                      },
                      {
                        label: 'Name',
                        dataKey: 'name',
                        width: 300,
                        flexGrow: 1,
                        cellDataGetter: getRowData,
                        cellRenderer: nameCellRenderer
                      },
                      {
                        label: 'Amount',
                        dataKey: 'amount',
                        headerClassName: 'alignRight',
                        style: {textAlign: 'right'},
                        cellRenderer: currencyCellRenderer,
                        width: 100
                      }
                    ]}
                    DetailComponent={TransactionDetail}
                    toView={Transaction.to.view}
                  />
                )}
              </AutoSizer>
            </Item>
          </Container>
          <div><Button onClick={downloadTransactions}>download transactions</Button></div>
          <div><Button onClick={addTransactions}>create transactions</Button></div>
          <div><Button onClick={deleteTransactions}>delete transactions</Button></div>
          <div><Link to={Account.to.edit(account)}>update</Link></div>
          <div><Link to={Account.to.del(account)}>delete</Link></div>
        </Grid>
      }
    </div>
  )
})

export const nameCellRenderer = ({cellData}: Column.CellRendererArgs<Transaction.Doc>) => (
  <div>
    {cellData.name}<br/>
    <small>{cellData.memo}</small>
  </div>
)
