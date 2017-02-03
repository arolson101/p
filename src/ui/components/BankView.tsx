import * as React from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Alert, PageHeader, ProgressBar, Table, Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { getAccounts } from '../../actions'
import { Bank, Account } from '../../docs'
import { withState2 } from '../enhancers'
import { AppState, mapDispatchToProps } from '../../state'
import { RouteProps, IntlProps } from './props'
import { selectBank } from './selectors'
import { SettingsMenu } from './SettingsMenu'

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

interface State {
  showAll: boolean
  setShowAll: (showAll: boolean) => void

  showModal: boolean
  setShowModal: (showModal: boolean) => void

  working: boolean
  setWorking: (working: boolean) => void

  error?: string
  setError: (error?: string) => void

  message?: string
  setMessage: (message?: string) => void
}

interface EnhancedProps {
  toggleShowAll: () => void
  getAccountList: () => void
  hideModal: () => void
}

type AllProps = EnhancedProps
  & State
  & ConnectedProps
  & DispatchProps
  & IntlProps
  & RouteProps<Bank.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('BankView'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps & RouteProps<Bank.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ getAccounts })
  ),
  withState2<State, ConnectedProps & DispatchProps & IntlProps & RouteProps<Bank.Params>>(
    {
      showAll: false,
      showModal: false,
      working: false,
      message: undefined,
      error: undefined
    },
    {
      setShowAll: 'showAll',
      setShowModal: 'showModal',
      setWorking: 'working',
      setMessage: 'message',
      setError: 'error'
    }
  ),
  withProps<EnhancedProps, State & ConnectedProps & DispatchProps & IntlProps & RouteProps<Bank.Params>>(
    props => ({
      toggleShowAll: () => {
        const { showAll, setShowAll } = props
        setShowAll(!showAll)
      },

      getAccountList: async () => {
        const { setShowModal, setWorking, setMessage, setError, getAccounts, bank, intl: { formatMessage } } = props
        setMessage(undefined)
        setError(undefined)
        setWorking(true)
        setShowModal(true)
        try {
          const message = await getAccounts({bank, formatMessage})
          setWorking(false)
          setMessage(message)
        } catch (ex) {
          setWorking(false)
          setError(ex.message)
        }
      },

      hideModal: () => {
        const { working, setShowModal } = props
        if (!working) {
          setShowModal(false)
        }
      }
    })
  )
)

export const BankView = enhance(props => {
  const { bank, router, toggleShowAll, hideModal, getAccountList } = props
  const { working, showModal, message, error, showAll } = props
  return (
    <div>
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
            to: Account.to.create(bank.doc)
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
            to: Bank.to.edit(bank.doc)
          },
          {
            message: messages.delete,
            to: Bank.to.del(bank.doc)
          }
        ]}
      />

      <PageHeader>{bank.doc.name}</PageHeader>

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
              <tr key={account.doc._id} href={router.createHref(Account.to.view(account.doc))}>
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

      <Modal show={showModal} onHide={hideModal}>
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
