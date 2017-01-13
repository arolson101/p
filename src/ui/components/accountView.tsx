import autobind = require('autobind-decorator')
import * as React from 'react'
import { Button, Grid, PageHeader } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import { compose, ComponentEnhancer, setDisplayName, withHandlers, withProps, withState, pure } from 'recompose'
import { getTransactions, deleteTransactions } from '../../actions'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState, CurrentDb, ResponsiveState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { Container, Item } from './flex'
import { RouteProps, DispatchProps } from './props'
import { queryState, QueryStateProps } from './queryState'
import { resolver, ResolveProps } from './resolver'
import { selectDbInfo, selectBank, selectAccount } from './selectors'
import { TransactionDetail } from './transactionDetail'
import { ResolvedTransactionList } from './transactionList'

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
  current: CurrentDb
  browser: ResponsiveState
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
  scrollTop: number
  setScrollTop: (scrollTop: number) => void
  selectedIndex: number
  setSelectedIndex: (selectedIndex: number) => void
  selectedTransaction?: Transaction.Doc
  transactions: Promise<Transaction.Doc[]>
  loadTransactions(): Promise<Transaction.Doc[]>
  setTransactions(promise: Promise<Transaction.Doc[]>): void
  addTransactions(): void
  downloadTransactions(): void
  deleteTransactions(): void
}


const enhance = compose(
  setDisplayName('AccountViewComponent'),
  withHandlers({
    loadTransactions: (props: AllProps) => async() => {
      if (!props.current || !props.account) {
        throw new Error('no db or account')
      }
      const startkey = Transaction.startkeyForAccount(props.account)
      const endkey = Transaction.endkeyForAccount(props.account)
      // const skip = 4000
      // const limit = 100
      const results = await props.current.db.allDocs({startkey, endkey, include_docs: true})
      const docs = results.rows.map(row => row.doc as Transaction.Doc)
      return docs
    }
  }),
  withState('scrollTop', 'setScrollTop', 0),
  withState('transactions', 'setTransactions', ({loadTransactions}: EnhancedProps) => loadTransactions()),
  withState('selectedIndex', 'setSelectedIndex', -1),
  withHandlers({
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
  pure
) as ComponentEnhancer<AllProps, {}>


export const AccountViewComponent = enhance((props: AllProps & EnhancedProps) => {
  const { bank, account, browser, scrollTop, setScrollTop, selectedIndex, transactions } = props
  const { downloadTransactions, addTransactions, deleteTransactions } = props
  const { selectedTransaction, router } = props
  const sideBySide = browser.greaterThan.small
  const listMaxWidth = sideBySide ? browser.breakpoints.extraSmall : Infinity
  // const setScrollTop = (scroll: number) => setPageState({scroll})
  const setSelectedIndex = (selection: number) => {
    // setPageState({selection})
    if (!sideBySide) {
      if (selectedTransaction) {
        router.push(Transaction.to.view(selectedTransaction))
      }
    }
  }
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
            <Item flex={1} style={{height: 500, maxWidth: listMaxWidth}}>
              <AutoSizer>
                {(props: AutoSizer.ChildrenProps) => (
                  <ResolvedTransactionList
                    transactions={transactions}
                    setScrollTop={setScrollTop}
                    scrollTop={scrollTop}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                    maxWidth={listMaxWidth}
                    {...props}
                  />
                )}
              </AutoSizer>
            </Item>
            {sideBySide &&
              <Item flex={1}>
                {selectedTransaction &&
                  <TransactionDetail {...props} transaction={selectedTransaction} />
                }
              </Item>
            }
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

const formName = 'AccountView'

export const AccountView = compose(
  injectIntl,
  // resolver,
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
    form: formName
  }),
  // queryState<PageState>({
  //   initial: {
  //     scroll: 0,
  //     selection: -1
  //   }
  // })
)(AccountViewComponent) as React.ComponentClass<{}>
