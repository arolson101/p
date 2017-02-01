import * as R from 'ramda'
import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { AutoSizer, Column } from 'react-virtualized'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import { getTransactions, deleteAllTransactions } from '../../actions'
import { Bank, Account, Transaction } from '../../docs'
import { AppState, pushChanges, mapDispatchToProps } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { Container, Item } from './flex'
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
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  getTransactions: getTransactions.Fcn
  deleteAllTransactions: deleteAllTransactions.Fcn
}

type AllProps = IntlProps & ConnectedProps & HandlerProps & DispatchProps

interface PageState {
  scroll: number
  selection: number
}

interface Values {
  date: string
  payee: string
  amount: string
}

interface HandlerProps {
  addTransactions(): void
  downloadTransactions(): void
  deleteTransactions(): void
}

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountViewComponent'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps & RouteProps<Account.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props!),
      account: selectAccount(state, props!),
      current: state.db.current!
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, getTransactions, deleteAllTransactions })
  ),
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
    },

    deleteTransactions: (props) => async () => {
      const { deleteAllTransactions, account } = props
      await deleteAllTransactions({account})
    }
  })
)

export const AccountView = enhance((props) => {
  const { bank, account } = props
  const { downloadTransactions, addTransactions, deleteTransactions } = props
  return (
    <div>
      {account && bank &&
        <Grid>
          <Breadcrumbs {...props}/>

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

          <PageHeader>
            {account.doc.name}
            {' '}
            <small>{account.doc.number}</small>
          </PageHeader>

          <Container>
            <Item flex={1} style={{height: 500}}>
              <AutoSizer>
                {(autoSizerProps: AutoSizer.ChildrenProps) => (
                  <ListWithDetails
                    items={account.transactions}
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
                )}
              </AutoSizer>
            </Item>
          </Container>
        </Grid>
      }
    </div>
  )
})

const nameCellRenderer = ({cellData}: Column.CellRendererArgs<Transaction.View>) => (
  <div>
    {cellData.doc.name}<br/>
    <small>{cellData.doc.memo}</small>
  </div>
)
