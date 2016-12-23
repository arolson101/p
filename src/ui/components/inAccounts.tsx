import autobind = require('autobind-decorator')
import * as React from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Alert, Grid, PageHeader, ProgressBar, Table, ButtonGroup, Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Link } from 'react-router'
import { getAccounts } from '../../actions'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps, IntlProps, DispatchProps } from './props'
import { selectDbInfo, selectInstitution, selectInstitutionAccounts } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inAccounts.page',
    defaultMessage: 'Accounts'
  }
})

interface Props {}

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  institution?: Institution.Doc
  accounts?: Account.Doc[]
}

type AllProps = Props & RouteProps<Institution.Params> & ConnectedProps & IntlProps & DispatchProps

interface State {
  showModal?: boolean
  working?: boolean
  message?: string
  error?: string
}

export class InAccountsComponent extends React.Component<AllProps, State> {
  state = {
    showModal: false,
    working: false,
    message: undefined,
    error: undefined
  }

  render() {
    const { institution, accounts, router, intl: { formatMessage } } = this.props
    const { working, showModal, message, error } = this.state
    return (
      <div>
        {institution &&
          <Grid>
            <Breadcrumbs {...this.props} page={formatMessage(messages.page)}/>
            <PageHeader>{institution.name}</PageHeader>
            {accounts && accounts.length > 0 &&
              <Table>
                <thead>
                  <tr>
                    <th>visible</th>
                    <th>type</th>
                    <th>name</th>
                    <th>number</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => account &&
                    <tr key={account._id}>
                      <td>{account.visible}</td>
                      <td><FormattedMessage {...Account.messages[account.type]}/></td>
                      <td>{account.name}</td>
                      <td>{account.number}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            }
            <ButtonGroup>
              <Button disabled={!institution.online} onClick={this.getAccountList}>get account list from server</Button>
              <Button href={router.createHref(Institution.to.update(institution))}>edit</Button>
              <Button href={router.createHref(Institution.to.accountCreate(institution))}>add account</Button>
            </ButtonGroup>

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

export const InAccounts = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Institution.Params>): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      institution: selectInstitution(state, props),
      accounts: selectInstitutionAccounts(state, props)
    })
  )
)(InAccountsComponent) as React.ComponentClass<Props>
