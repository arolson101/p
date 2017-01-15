import * as React from 'react'
import { Button, Grid, PageHeader } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { AutoSizer } from 'react-virtualized'
import { compose, setDisplayName, withHandlers, withState, pure } from 'recompose'
import { getTransactions, deleteTransactions } from '../../actions'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb, ResponsiveState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { Container, Item } from './flex'
import { RouteProps, DispatchProps } from './props'
import { withQuerySyncedState } from './queryState'
import { selectDbInfo, selectBank, selectAccount } from './selectors'
import { TransactionDetail } from './transactionDetail'
import { TransactionList } from './transactionList'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
  current: CurrentDb
}

type AllProps = RouteProps<Account.Params>
  & ConnectedProps
  & DispatchProps
  & ReduxFormProps<Values>

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
  loadTransactions(): Promise<Transaction.Doc[]>
  setTransactions(promise: Promise<Transaction.Doc[]>): void
  addTransactions(): void
  downloadTransactions(): void
  deleteTransactions(): void
}

const formName = 'AccountView'

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
  reduxForm<AllProps, Values>({
    form: formName
  }),
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
    },

    addTransactions: (props: EnhancedProps) => async() => {
      const { current, account, loadTransactions } = props
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
      loadTransactions()
    },

    downloadTransactions: (props: EnhancedProps) => async () => {
      const { dispatch, bank, account, loadTransactions } = props
      await dispatch(getTransactions(bank!, account!, new Date(2016, 11, 1), new Date(2016, 11, 31), (str) => str.defaultMessage!))
      loadTransactions()
    },

    deleteTransactions: (props: EnhancedProps) => async() => {
      const { dispatch, account, loadTransactions } = props
      await dispatch(deleteTransactions(account!))
      loadTransactions()
    }
  }),
  withState('transactions', 'setTransactions', ({loadTransactions}: EnhancedProps) => loadTransactions()),
  pure
)

export const AccountView = enhance((props) => {
  const { bank, account, transactions } = props
  const { downloadTransactions, addTransactions, deleteTransactions } = props
  return (
    <div>
      {account && bank && transactions &&
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
                  <TransactionListDetails transactions={transactions} {...autoSizerProps} />
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

const SpinnerRender = () => <div>loading</div>
const ErrorRender = ({ transactions: error }: { transactions: Error }) => <div>error: {error.message}</div>

import { withProps, renderComponent } from 'recompose'
import { withResolveProp } from './resolveProp'

interface PProps {
  transactions: Promise<Transaction.Doc[]>
  width: number
  height: number
}

interface ConnectedPProps {
  browser: ResponsiveState
}

type EnhancedPProps = PProps & ConnectedPProps & RouteProps<any> & {
  width: number
  height: number
  scrollTop: number
  sideBySide: boolean
  setScrollTop: (scrollTop: number) => void
  selectedIndex: number
  setSelectedIndex(selectedIndex: number): void
  onSetSelectedIndex(selectedIndex: number): void
  transactions: Transaction.Doc[]
}

const enhance2 = compose<EnhancedPProps, PProps>(
  setDisplayName('TransactionListDetails'),
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedPProps => ({
      browser: state.browser
    })
  ),
  withResolveProp(
    'transactions',
    renderComponent(SpinnerRender),
    renderComponent(ErrorRender)
  ),
  withProps(({browser}: EnhancedPProps) => ({
    sideBySide: browser.greaterThan.small
  })),
  withQuerySyncedState('scrollTop', 'setScrollTop', 0, parseFloat),
  withQuerySyncedState('selectedIndex', 'setSelectedIndex', -1, parseFloat),
  withHandlers({
    onSetSelectedIndex: ({setSelectedIndex, transactions, sideBySide, router}: EnhancedPProps) => (selectedIndex: number) => {
      setSelectedIndex(selectedIndex)
      if (!sideBySide && selectedIndex !== -1) {
        router.push(Transaction.to.view(transactions[selectedIndex]))
      }
    }
  }),
  pure
)

const TransactionListDetails = enhance2((props) => {
  const { sideBySide, browser, scrollTop, setScrollTop, onSetSelectedIndex, selectedIndex, transactions } = props
  const listMaxWidth = sideBySide ? browser.breakpoints.extraSmall : Infinity
  const selectedTransaction = selectedIndex !== -1 ? transactions[selectedIndex] : undefined
  return (
    <Container>
      <Item flex={1} style={{maxWidth: listMaxWidth}}>
        <TransactionList
          transactions={transactions}
          setScrollTop={setScrollTop}
          scrollTop={scrollTop}
          selectedIndex={selectedIndex}
          setSelectedIndex={onSetSelectedIndex}
          maxWidth={listMaxWidth}
          width={Math.min(props.width, listMaxWidth)}
          height={props.height}
        />
      </Item>
      {sideBySide &&
        <Item flex={1}>
          {selectedTransaction &&
            <TransactionDetail {...props} transaction={selectedTransaction} />
          }
        </Item>
      }
    </Container>
  )
})
