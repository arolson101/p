import * as R from 'ramda'
import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Column } from 'react-virtualized'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers, mapPropsStream } from 'recompose'
import * as Rx from 'rxjs/Rx'
import { getTransactions, deleteAllTransactions } from '../../actions/index'
import { Bank, Account, Transaction } from '../../docs/index'
import { AppState, pushChanges, mapDispatchToProps } from '../../state/index'
import { ListWithDetails, dateCellRenderer, currencyCellRenderer } from './ListWithDetails'
import { RouteProps, IntlProps } from './props'
import { selectBank, selectAccount } from './selectors'
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
  actions: {
    id: 'accountView.actions',
    defaultMessage: 'Actions'
  },
  account: {
    id: 'accountView.account',
    defaultMessage: 'Account'
  },
  downloadTransactions: {
    id: 'accountView.downloadTransactions',
    defaultMessage: 'Download Transactions'
  }
})

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
  db: PouchDB.Database<Transaction.Doc>
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  getTransactions: getTransactions.Fcn
  deleteAllTransactions: deleteAllTransactions.Fcn
}

type StreamProps = ConnectedProps & RouteProps<Account.Params>
type AllProps = IntlProps & ConnectedProps & HandlerProps & DispatchProps

interface HandlerProps {
  addTransactions (): void
  downloadTransactions (): void
  deleteTransactions (): void
}

const enhance = compose<AllProps, RouteProps<Account.Params>>(
  setDisplayName('AccountViewComponent'),
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps & RouteProps<Account.Params>>(
    (state: AppState, props): ConnectedProps => ({
      bank: selectBank(state, props!),
      account: selectAccount(state, props!),
      db: state.db.current!.db
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, getTransactions, deleteAllTransactions })
  ),
  // mapPropsStream(
  //   (props$: Rx.Observable<StreamProps>) => {
  //     const transactions$ = props$
  //       .map(({ db, match: { params } }) => ({ db, params }))
  //       .distinctUntilChanged(R.equals as any)
  //       .switchMap(({ db, params }) => {
  //         console.log('params: ', params)
  //         const accountId = Account.docId(params)
  //         console.log('query for transactions: ', accountId)
  //         console.time('query')
  //         return db.allDocs({
  //           startkey: Transaction.startkeyForAccountId(accountId),
  //           endkey: Transaction.endkeyForAccountId(accountId),
  //           include_docs: true,
  //           // limit: 300,
  //           // skip: 8000
  //         })
  //       })
  //       .map(response => {
  //         console.timeEnd('query')
  //         console.log(`${response.rows.length} transactions`)
  //         let balance = 0
  //         const transactions = response.rows
  //           .map(row => row.doc!)
  //           .filter(doc => doc)
  //           .map(doc => {
  //             balance += doc.amount
  //             return Transaction.buildView(doc, balance)
  //           })
  //         return { transactions }
  //       })
  //       .startWith({ transactions: [] })
  //     return props$.combineLatest(transactions$, (props, transactions) => ({ ...props, ...transactions }))
  //   }
  // ),
  withHandlers<HandlerProps, ConnectedProps & DispatchProps & IntlProps & RouteProps<Account.Params>>({
    addTransactions: (props) => () => {
      const { pushChanges, account } = props
      const changes: ChangeSet = new Set()
      let balance = 0
      for (let i = 0; i < 1000; i++) {
        const time = new Date(2016, 11, i, Math.trunc(Math.random() * 24), Math.trunc(Math.random() * 60))
        const tx = Transaction.doc(account.doc, {
          time: time.valueOf(),
          name: 'payee ' + i + ' ' + Math.random() * 100,
          type: '',
          memo: '',
          amount: (Math.random() - 0.5) * 1000,
          split: {}
        })
        changes.add(tx)
        balance += tx.amount
      }

      pushChanges({docs: Array.from(changes)})
    },

    downloadTransactions: (props) => async () => {
      const { getTransactions, bank, account, intl: { formatMessage } } = props
      const start = new Date(2016, 11, 1)
      const end = new Date(2016, 11, 31)
      await getTransactions({bank, account, start, end, formatMessage})
      // TODO: try/catch
    },

    deleteTransactions: (props) => async () => {
      const { deleteAllTransactions, account } = props
      await deleteAllTransactions({account})
      // TODO: try/catch
    }
  })
)

export const AccountView = enhance((props) => {
  const { account } = props
  const { downloadTransactions, addTransactions, deleteTransactions } = props
  // const transactions = (props as any).transactions
  const transactions = account.transactions
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <PageHeader>
        <SettingsMenu
          items={[
            {
              message: messages.actions,
              header: true
            },
            {
              message: messages.downloadTransactions,
              onClick: downloadTransactions
            },
            __DEVELOPMENT__ && {
              message: '★ create transactions',
              onClick: addTransactions
            },
            __DEVELOPMENT__ && {
              message: '★ delete transactions',
              onClick: deleteTransactions
            },
            {
              divider: true
            },
            {
              message: messages.account,
              header: true
            },
            {
              message: messages.update,
              to: Account.to.edit(account.doc)
            },
            {
              message: messages.delete,
              to: Account.to.del(account.doc)
            }
          ]}
        />

        {account.doc.name}
        {' '}
        <small>{account.doc.number}</small>
      </PageHeader>

      <div style={{flex: 1}}>
        <ListWithDetails
          items={transactions}
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
              cellDataGetter: R.path(['rowData']),
              cellRenderer: nameCellRenderer
            },
            {
              label: 'Amount',
              dataKey: 'amount',
              headerClassName: 'alignRight',
              style: {textAlign: 'right'},
              cellDataGetter: R.path(['rowData', 'doc', 'amount']),
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
      </div>
    </div>
  )
})

const nameCellRenderer = ({cellData}: Column.CellRendererArgs<Transaction.View>) => (
  <div>
    {cellData.doc.name}<br/>
    <small>{cellData.doc.memo}</small>
  </div>
)
