import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { AutoSizer, Column } from 'react-virtualized'
import { compose, setDisplayName, withHandlers, withState, renderComponent } from 'recompose'
import { getTransactions, deleteTransactions } from '../../actions'
import { DbInfo, Bank, Account, Transaction, Statement } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { withResolveProp } from '../enhancers'
import { Breadcrumbs } from './Breadcrumbs'
import { Container, Item } from './flex'
import { ListWithDetails, getRowData, dateCellRenderer, currencyCellRenderer } from './ListWithDetails'
import { RouteProps, DispatchProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'
import { SettingsMenu } from './SettingsMenu'
import { TransactionDetail } from './TransactionDetail'

const messages = defineMessages({
  settings: {
    id: 'accountView.settings',
    defaultMessage: 'Options'
  },
  update: {
    id: 'accountView.update',
    defaultMessage: 'Edit'
  },
  delete: {
    id: 'accountView.delete',
    defaultMessage: 'Delete'
  },
  downloadTransactions: {
    id: 'accountView.downloadTransactions',
    defaultMessage: 'Download Transactions'
  }
})

interface ConnectedProps {
  dbInfo?: DbInfo
  bank?: Bank.Doc
  account?: Account.Doc
  current: CurrentDb
}

type AllProps = ConnectedProps & EnhancedProps & DispatchProps

interface PageState {
  scroll: number
  selection: number
}

interface Values {
  date: string
  payee: string
  amount: string
}

type LedgerTransaction = Transaction.Doc & { balance: number }

interface EnhancedProps {
  transactions: Promise<Transaction.Doc[]>
  items: Transaction.Doc[]
  loadTransactions(): Promise<LedgerTransaction[]>
  setTransactions(promise: Promise<LedgerTransaction[]>): void
  addTransactions(): void
  downloadTransactions(): void
  deleteTransactions(): void
}

const SpinnerRender = () => <div>loading</div>
const ErrorRender = ({ transactions: error }: { transactions: Error }) => <div>error: {error.message}</div>

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountViewComponent'),
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      account: selectAccount(state, props),
      current: state.db.current!
    })
  ),
  withHandlers<AllProps,AllProps>({
    loadTransactions: (props) => async(): Promise<LedgerTransaction[]> => {
      if (props.current && props.account) {
        const opts = {
          startkey: Transaction.startkeyForAccount(props.account),
          endkey: Transaction.endkeyForAccount(props.account),
          include_docs: true
        }
        const results = await props.current.db.allDocs(opts)
        const docs = results.rows.map(row => row.doc as Transaction.Doc)
        const statements = Statement.statementsForAccount(props.current.cache.statements, props.account)
        const ledgerTransactions: LedgerTransaction[] = []
        for (let statement of statements) {
          const transactions = Statement.transactionsForStatement(statement, docs)
          let balance = statement.openingBalance
          for (let transaction of transactions) {
            ledgerTransactions.push({
              ...transaction,
              balance
            })
            balance += transaction.amount
          }
        }
        return ledgerTransactions
      } else {
        return []
      }
    }
  }),
  withState('transactions', 'setTransactions', ({loadTransactions}: AllProps) => loadTransactions()),
  withHandlers<AllProps,AllProps>({
    addTransactions: (props) => async() => {
      const { current, account, setTransactions, loadTransactions } = props
      const statements = new Map(current.cache.statements)
      const changes: ChangeSet = new Set()
      let balance = 0
      for (let i = 0; i < 1000; i++) {
        const time = new Date(2016, 11, i, Math.trunc(Math.random() * 24), Math.trunc(Math.random() * 60))
        let statement = Statement.get(statements, account!, time)
        if (!statement) {
          statement = Statement.create(account!, time)
          statements.set(statement._id, statement)
          changes.add(statement)
        }
        const tx = Transaction.doc(account!, {
          time: time.valueOf(),
          name: 'payee ' + i + ' ' + Math.random() * 100,
          type: '',
          memo: '',
          amount: (Math.random() - 0.5) * 1000,
          split: {}
        })
        changes.add(tx)
        balance += tx.amount
        Statement.addTransaction(statement, tx, changes)
      }

      Statement.updateBalances(statements, account!, balance, new Date(), changes)
      current.db.bulkDocs(Array.from(changes))
      setTransactions(loadTransactions())
    },

    downloadTransactions: (props: AllProps) => async () => {
      const { dispatch, bank, account, setTransactions, loadTransactions } = props
      await dispatch(getTransactions(bank!, account!, new Date(2016, 11, 1), new Date(2016, 11, 31), (str) => str.defaultMessage!))
      setTransactions(loadTransactions())
    },

    deleteTransactions: (props: AllProps) => async() => {
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

          <SettingsMenu
            items={[
              {
                message: '_Actions',
                header: true
              },
              {
                message: messages.downloadTransactions,
                onClick: downloadTransactions
              },
              __DEVELOPMENT__ && {
                message: 'create transactions',
                onClick: addTransactions
              },
              __DEVELOPMENT__ && {
                message: 'delete transactions',
                onClick: deleteTransactions
              },
              {
                divider: true
              },
              {
                message: '_Account',
                header: true
              },
              {
                message: messages.update,
                to: Account.to.edit(account)
              },
              {
                message: messages.delete,
                to: Account.to.del(account)
              }
            ]}
          />

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
                        width: 120
                      },
                      {
                        label: 'Balance',
                        dataKey: 'balance',
                        headerClassName: 'alignRight',
                        style: {textAlign: 'right'},
                        cellRenderer: currencyCellRenderer,
                        width: 120
                      }
                    ]}
                    DetailComponent={TransactionDetail}
                    toView={Transaction.to.view}
                  />
                )}
              </AutoSizer>
            </Item>
          </Container>
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
