import autobind = require('autobind-decorator')
import * as React from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Alert, Grid, PageHeader, ProgressBar, Table, ButtonGroup, DropdownButton, MenuItem, Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose } from 'redux'
import { getAccounts } from '../../actions'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps, IntlProps, DispatchProps } from './props'
import { selectDbInfo, selectInstitution, selectInstitutionAccounts } from './selectors'

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

interface Props {}

interface ConnectedProps {
  institution?: Institution.Doc
  dbInfo?: DbInfo.Doc
  accounts?: Account.Doc[]
}

type AllProps = Props & RouteProps<Institution.Params> & ConnectedProps & IntlProps & DispatchProps

interface State {
  showAll?: boolean
  showModal?: boolean
  working?: boolean
  message?: string
  error?: string
}

export class InReadComponent extends React.Component<AllProps, State> {
  state = {
    showAll: false,
    showModal: false,
    working: false,
    message: undefined,
    error: undefined
  }

  render() {
    const { institution, accounts, router, intl: { formatMessage } } = this.props
    const { working, showModal, message, error, showAll } = this.state
    return (
      <div>
        {institution &&
          <Grid>
            <Breadcrumbs {...this.props}/>
            <PageHeader>{institution.name}</PageHeader>

            <ButtonGroup className='pull-right'>
            <DropdownButton bsSize='small' id='in-action-menu' title={formatMessage(messages.settings)} pullRight>
              {/* update */}
              <MenuItem href={router.createHref(Institution.to.update(institution))}>
                <FormattedMessage {...messages.update}/>
              </MenuItem>
              {/* showAll */}
              <MenuItem checked={showAll} onClick={this.toggleShowAll}>
                <FormattedMessage {...messages.showAll}/>
              </MenuItem>
              {/* get account list */}
              <MenuItem disabled={!institution.online} onClick={this.getAccountList}>
                <FormattedMessage {...messages.getAccounts}/>
              </MenuItem>
              <MenuItem divider />
              {/* delete */}
              <MenuItem href={router.createHref(Institution.to.del(institution))}>
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
                    <tr key={account._id} href={router.createHref(Account.to.read(account))}>
                      {showAll &&
                        <td>{account.visible}</td>
                      }
                      <td><FormattedMessage {...Account.messages[account.type]}/></td>
                      <td><Link to={Account.to.read(account)}>{account.name}</Link></td>
                      <td><Link to={Account.to.read(account)}>{account.number}</Link></td>
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
    const { dispatch, institution, intl: { formatMessage } } = this.props
    this.setState({ showModal: true, working: true, message: undefined, error: undefined })
    try {
      const message = await dispatch(getAccounts(institution!, formatMessage))
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

export const InRead = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Institution.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      institution: selectInstitution(state, props),
      accounts: selectInstitutionAccounts(state, props)
    })
  )
)(InReadComponent) as React.ComponentClass<Props>
