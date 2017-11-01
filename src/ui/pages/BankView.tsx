import * as PropTypes from 'prop-types'
import * as React from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Alert, PageHeader, ProgressBar, Table, Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers, withState } from 'recompose'
import { getAccounts } from 'core/actions'
import { Bank, Account } from 'core/docs'
import { AppState, mapDispatchToProps } from 'core/state'
import { selectBank, selectBankAccounts } from 'core/selectors'
import { SettingsMenu } from '../components/SettingsMenu'
import { showAccountDialog, showBankDialog, showBankDeleteDialog } from '../dialogs'

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

type RouteProps = RouteComponentProps<Bank.Params>

interface Props {
  bankId: Bank.DocId
}

interface ConnectedProps {
  bank: Bank.View
  accounts: Account.View[]
}

interface DispatchProps {
  getAccounts: getAccounts.Fcn
  showAccountDialog: typeof showAccountDialog
  showBankDialog: typeof showBankDialog
  showBankDeleteDialog: typeof showBankDeleteDialog
}

interface State {
  showAll?: boolean
  setShowAll: (showAll: boolean) => void
  showModal?: boolean
  setShowModal: (showModal: boolean) => void
  working?: boolean
  setWorking: (working: boolean) => void
  error?: string
  setError: (error?: string) => void
  message?: string
  setMessage: (message?: string) => void
}

interface Handlers {
  toggleEdit: () => void
  toggleShowAll: () => void
  getAccountList: () => void
  hideModal: () => void
  createAccount: () => void
  deleteBank: () => void
}

type EnhancedProps = Handlers
  & State
  & ConnectedProps
  & DispatchProps
  & IntlProps
  & RouteProps
  & Props

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('BankView'),
  onlyUpdateForPropTypes,
  setPropTypes({
    bankId: PropTypes.string.isRequired
  }),
  injectIntl,
  withRouter,
  connect<ConnectedProps, DispatchProps, IntlProps & RouteProps & Props>(
    (state: AppState, props) => ({
      bank: selectBank(state, props && props.bankId)!,
      accounts: selectBankAccounts(state, props && props.bankId)!,
    }),
    mapDispatchToProps<DispatchProps>({ getAccounts, showBankDialog, showAccountDialog, showBankDeleteDialog })
  ),
  withState('showAll', 'setShowAll', false),
  withState('showModal', 'setShowModal', false),
  withState('working', 'setWorking', false),
  withState('error', 'setError', undefined),
  withState('message', 'setMessage', undefined),
  withHandlers<State & ConnectedProps & DispatchProps & IntlProps & RouteProps & Props, Handlers>({
    toggleEdit: ({ bank: edit, showBankDialog }) => () => {
      showBankDialog({ edit })
    },

    toggleShowAll: ({ showAll, setShowAll }) => () => {
      setShowAll(!showAll)
    },

    getAccountList: ({ setMessage, setError, setWorking, setShowModal, getAccounts, bank, intl: { formatMessage } }) => async () => {
      setMessage(undefined)
      setError(undefined),
      setWorking(true),
      setShowModal(true)
      try {
        const message = await getAccounts({ bank, formatMessage })
        setWorking(false)
        setMessage(message)
      } catch (ex) {
        setWorking(false)
        setError(ex.message)
      }
    },

    hideModal: ({ working, setShowModal }) => () => {
      if (!working) {
        setShowModal(false)
      }
    },

    createAccount: ({ bank, showAccountDialog }) => () => {
      showAccountDialog({ bank })
    },

    deleteBank: ({ bank, showBankDeleteDialog }) => () => {
      showBankDeleteDialog({ bank })
    }
  })
)

export const BankViewRoute = (props: RouteComponentProps<Bank.Params>) =>
  <BankView
    bankId={Bank.docId(props.match.params)}
  />

export const BankView = enhance((props) => {
  const { bank, accounts, history, toggleShowAll, hideModal, getAccountList, toggleEdit, createAccount, deleteBank } = props
  const { working, showModal, message, error, showAll } = props
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

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
              onClick: createAccount
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
              onClick: deleteBank,
            }
          ]}
        />

        {bank.doc.name}
      </PageHeader>

      {bank.doc.accounts.length > 0 ? (
        <Table hover striped>
          <thead>
            <tr>
              {showAll &&
                <th style={{ width: '10%' }}><FormattedMessage {...messages.visible}/></th>
              }
              <th style={{ width: '20%' }}><FormattedMessage {...messages.type}/></th>
              <th><FormattedMessage {...messages.name}/></th>
              <th><FormattedMessage {...messages.number}/></th>
            </tr>
          </thead>
          <tbody>
            {accounts.filter(account => account.doc.visible || showAll).map(account => account &&
              <tr key={account.doc._id} {...{ href: history.createHref({ pathname: Account.to.view(account.doc) }) }}>
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
