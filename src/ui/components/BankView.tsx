import * as React from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Alert, PageHeader, ProgressBar, Table, Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers, withState } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { getAccounts } from '../../actions/index'
import { Bank, Account } from '../../docs/index'
import { AppState, mapDispatchToProps } from '../../state/index'
import { RouteProps, IntlProps } from './props'
import { selectBank } from './selectors'
import { SettingsMenu } from './SettingsMenu'
import { AccountDialog } from './AccountDialog'
import { BankDialog } from './BankDialog'

const messages = defineMessages({
  noAccounts: {
    id: 'BankView.noAccounts',
    defaultMessage: 'No Accounts'
  },
  settings: {
    id: 'BankView.settings',
    defaultMessage: 'Options'
  },
  update: {
    id: 'BankView.update',
    defaultMessage: 'Edit'
  },
  showAll: {
    id: 'BankView.showAll',
    defaultMessage: 'Show all accounts'
  },
  addAccount: {
    id: 'BankView.addAccount',
    defaultMessage: 'Add account'
  },
  getAccounts: {
    id: 'BankView.getAccounts',
    defaultMessage: 'Get account list from server'
  },
  delete: {
    id: 'BankView.delete',
    defaultMessage: 'Delete'
  },
  visible: {
    id: 'BankView.visible',
    defaultMessage: 'Visible'
  },
  type: {
    id: 'BankView.type',
    defaultMessage: 'Type'
  },
  name: {
    id: 'BankView.name',
    defaultMessage: 'Name'
  },
  number: {
    id: 'BankView.number',
    defaultMessage: 'Number'
  }
})

interface ConnectedProps {
  bank: Bank.View
}

interface DispatchProps {
  getAccounts: getAccounts.Fcn
}

interface UIState {
  editing?: boolean
  showAll?: boolean
  showModal?: boolean
  accountCreating?: boolean
  working?: boolean
  error?: string
  message?: string
}

interface Handlers {
  toggleEdit: () => void
  toggleShowAll: () => void
  getAccountList: () => void
  hideModal: () => void
  toggleAccountCreate: () => void
}

type EnhancedProps = Handlers
  & ReduxUIProps<UIState>
  & ConnectedProps
  & DispatchProps
  & IntlProps
  & RouteProps<Bank.Params>

const enhance = compose<EnhancedProps, undefined>(
  setDisplayName('BankView'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  withRouter,
  connect<ConnectedProps, DispatchProps, IntlProps & RouteProps<Bank.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ getAccounts })
  ),
  ui<UIState, ConnectedProps & DispatchProps & IntlProps & RouteProps<Bank.Params>, {}>({
    state: {
      editing: false,
      showAll: false,
      showModal: false,
      accountCreating: false,
      working: false,
      message: undefined,
      error: undefined
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & ConnectedProps & DispatchProps & IntlProps & RouteProps<Bank.Params>>({
    toggleEdit: ({ ui: { editing }, updateUI }) => () => {
      updateUI({editing: !editing})
    },

    toggleShowAll: ({ ui: { showAll }, updateUI }) => () => {
      updateUI({showAll: !showAll})
    },

    getAccountList: ({ updateUI, getAccounts, bank, intl: { formatMessage } }) => async () => {
      updateUI({
        message: undefined,
        error: undefined,
        working: true,
        showModal: true
      })
      try {
        const message = await getAccounts({bank, formatMessage})
        updateUI({ working: false, message })
      } catch (ex) {
        updateUI({ working: false, error: ex.message })
      }
    },

    hideModal: ({ ui: { working }, updateUI }) => () => {
      if (!working) {
        updateUI({showModal: false})
      }
    },

    toggleAccountCreate: ({ ui: { accountCreating }, updateUI }) => () => {
      updateUI({accountCreating: !accountCreating})
    }
  })
)

export const BankView = enhance((props) => {
  const { bank, history, toggleShowAll, hideModal, getAccountList, toggleEdit, toggleAccountCreate } = props
  const { ui: { editing, working, showModal, message, error, showAll, accountCreating } } = props
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>

      <PageHeader>
        <SettingsMenu
          items={[
            {
              message: '_View',
              header: true
            },
            {
              message: messages.showAll,
              onClick: toggleShowAll
            },
            {
              message: '_Accounts',
              header: true
            },
            {
              message: messages.addAccount,
              onClick: toggleAccountCreate
            },
            {
              message: messages.getAccounts,
              onClick: getAccountList,
              disabled: !bank.doc.online
            },
            {
              divider: true
            },
            {
              message: '_Institution',
              header: true
            },
            {
              message: messages.update,
              onClick: toggleEdit,
              // to: Bank.to.edit(bank.doc)
            },
            {
              message: messages.delete,
              to: Bank.to.del(bank.doc)
            }
          ]}
        />

        {bank.doc.name}
      </PageHeader>

      {bank.accounts.length > 0 ? (
        <Table hover striped>
          <thead>
            <tr>
              {showAll &&
                <th width='10%'><FormattedMessage {...messages.visible}/></th>
              }
              <th width='20%'><FormattedMessage {...messages.type}/></th>
              <th><FormattedMessage {...messages.name}/></th>
              <th><FormattedMessage {...messages.number}/></th>
            </tr>
          </thead>
          <tbody>
            {bank.accounts.filter(account => account.doc.visible || showAll).map(account => account &&
              <tr key={account.doc._id} href={history.createHref({pathname: Account.to.view(account.doc)})}>
                {showAll &&
                  <td>{account.doc.visible}</td>
                }
                <td>{account.doc.type && <FormattedMessage {...Account.messages[account.doc.type]}/>}</td>
                <td><Link to={Account.to.view(account.doc)}>{account.doc.name}</Link></td>
                <td><Link to={Account.to.view(account.doc)}>{account.doc.number}</Link></td>
              </tr>
            )}
          </tbody>
        </Table>
      ) : (
        <FormattedMessage {...messages.noAccounts}/>
      )}

      <BankDialog show={!!editing} edit={bank.doc} onHide={toggleEdit}/>
      <AccountDialog bank={bank} show={!!accountCreating} onHide={toggleAccountCreate}/>

      <Modal show={showModal} onHide={hideModal} backdrop='static'>
        <Modal.Header>
          <Modal.Title>Downloading Account List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {working &&
            <div>
              <p>contacting server...</p>
              <ProgressBar active now={50}/>
            </div>
          }
          {message &&
            <Alert bsStyle='info'><Nl2br text={message}/></Alert>
          }
          {error &&
            <Alert bsStyle='danger'><Nl2br text={error}/></Alert>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={working} onClick={hideModal}>close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
})

const Nl2br = (props: {text: string}) => {
  return (
    <span>
    {props.text.split('\n').map((item, i) =>
      <span key={i}>{item}<br/></span>
    )}
    </span>
  )
}
