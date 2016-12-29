import autobind = require('autobind-decorator')
import * as React from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Alert, Grid, PageHeader, ProgressBar, Table, ButtonGroup, DropdownButton, MenuItem, Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose } from 'redux'
import { getAccounts } from '../../actions'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps, IntlProps, DispatchProps } from './props'
import { selectDbInfo, selectBank, selectBankAccounts } from './selectors'

const messages = defineMessages({
  noAccounts: {
    id: 'inRead.noAccounts',
    defaultMessage: 'No Accounts'
  },
  settings: {
    id: 'inRead.settings',
    defaultMessage: 'Options'
  },
  update: {
    id: 'inRead.update',
    defaultMessage: 'Edit'
  },
  showAll: {
    id: 'inRead.showAll',
    defaultMessage: 'Show all accounts'
  },
  addAccount: {
    id: 'inRead.addAccount',
    defaultMessage: 'Add account'
  },
  getAccounts: {
    id: 'inRead.getAccounts',
    defaultMessage: 'Get account list from server'
  },
  delete: {
    id: 'inRead.delete',
    defaultMessage: 'Delete'
  },
  visible: {
    id: 'inRead.visible',
    defaultMessage: 'Visible'
  },
  type: {
    id: 'inRead.type',
    defaultMessage: 'Type'
  },
  name: {
    id: 'inRead.name',
    defaultMessage: 'Name'
  },
  number: {
    id: 'inRead.number',
    defaultMessage: 'Number'
  }
})

interface ConnectedProps {
  bank?: Bank.Doc
  dbInfo?: DbInfo.Doc
  accounts?: Account.Doc[]
}

type AllProps = RouteProps<Bank.Params> & ConnectedProps & IntlProps & DispatchProps

interface State {
  showAll?: boolean
  showModal?: boolean
  working?: boolean
  message?: string
  error?: string
}

export class BankViewComponent extends React.Component<AllProps, State> {
  state = {
    showAll: false,
    showModal: false,
    working: false,
    message: undefined,
    error: undefined
  }

  render() {
    const { bank, accounts, router, intl: { formatMessage } } = this.props
    const { working, showModal, message, error, showAll } = this.state
    return (
      <div>
        {bank &&
          <Grid>
            <Breadcrumbs {...this.props}/>
            <PageHeader>{bank.name}</PageHeader>

            <ButtonGroup className='pull-right'>
            <DropdownButton bsSize='small' id='in-action-menu' title={formatMessage(messages.settings)} pullRight>
              <MenuItem header>View</MenuItem>
              {/* showAll */}
              <MenuItem active={showAll} onClick={this.toggleShowAll}>
                <FormattedMessage {...messages.showAll}/>
              </MenuItem>
              <MenuItem divider />
              <MenuItem header>Accounts</MenuItem>
              {/* add account */}
              <MenuItem href={router.createHref(Account.to.create(bank))}>
                <FormattedMessage {...messages.addAccount}/>
              </MenuItem>
              {/* get account list */}
              <MenuItem disabled={!bank.online} onClick={this.getAccountList}>
                <FormattedMessage {...messages.getAccounts}/>
              </MenuItem>
              <MenuItem divider />
              <MenuItem header>Institution</MenuItem>
              {/* update */}
              <MenuItem href={router.createHref(Bank.to.edit(bank))}>
                <FormattedMessage {...messages.update}/>
              </MenuItem>
              {/* delete */}
              <MenuItem href={router.createHref(Bank.to.del(bank))}>
                <FormattedMessage {...messages.delete}/>
              </MenuItem>
            </DropdownButton>
            </ButtonGroup>

            {accounts && accounts.length > 0 ? (
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
                  {accounts.filter(account => account.visible || showAll).map(account => account &&
                    <tr key={account._id} href={router.createHref(Account.to.view(account))}>
                      {showAll &&
                        <td>{account.visible}</td>
                      }
                      <td><FormattedMessage {...Account.messages[account.type]}/></td>
                      <td><Link to={Account.to.view(account)}>{account.name}</Link></td>
                      <td><Link to={Account.to.view(account)}>{account.number}</Link></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            ) : (
              <FormattedMessage {...messages.noAccounts}/>
            )}

            <Modal show={showModal} onHide={this.hideModal}>
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
                <Button disabled={working} onClick={this.hideModal}>close</Button>
              </Modal.Footer>
            </Modal>
          </Grid>
        }
      </div>
    )
  }

  @autobind
  toggleShowAll() {
    const { showAll } = this.state
    this.setState({ showAll: !showAll })
  }

  @autobind
  async getAccountList() {
    const { dispatch, bank, intl: { formatMessage } } = this.props
    this.setState({ showModal: true, working: true, message: undefined, error: undefined })
    try {
      const message = await dispatch(getAccounts(bank!, formatMessage))
      this.setState({ working: false, message })
    } catch (ex) {
      this.setState({ working: false, error: ex.message })
    }
  }

  @autobind
  hideModal() {
    const { working } = this.state
    if (!working) {
      this.setState({ showModal: false })
    }
  }
}

const Nl2br = (props: {text: string}) => {
  return (
    <span>
    {props.text.split('\n').map((item, i) =>
      <span key={i}>{item}<br/></span>
    )}
    </span>
  )
}

export const BankView = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Bank.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      accounts: selectBankAccounts(state, props)
    })
  )
)(BankViewComponent) as React.ComponentClass<{}>
