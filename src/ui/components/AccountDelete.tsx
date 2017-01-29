import autobind = require('autobind-decorator')
import * as React from 'react'
import { Grid, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { deleteAccount } from '../../actions'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { forms } from './forms'
import { DispatchProps, RouteProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'

const messages = defineMessages({
  page: {
    id: 'acDelete.page',
    defaultMessage: 'Delete'
  },
  confirm: {
    id: 'acDelete.confirm',
    defaultMessage: 'Delete Account'
  },
  text: {
    id: 'acDelete.text',
    defaultMessage: "This will delete account '{name}' and all its transactions.  Are you sure?"
  }
})

interface ConnectedProps {
  current: CurrentDb
  dbInfo?: DbInfo
  bank?: Bank.Doc
  account?: Account.Doc
}

type AllProps = ConnectedProps & DispatchProps & RouteProps<Account.Params>

interface State {
  error?: string
  deleting?: boolean
}

export class AccountDeleteComponent extends React.Component<AllProps, State> {
  state: State = {
    error: undefined,
    deleting: false
  }

  render() {
    const { router, account } = this.props
    const { error, deleting } = this.state
    return (
      <div>
        {account &&
          <Grid>
            <Breadcrumbs {...this.props} page={messages.page}/>
            <div>
              <p><FormattedMessage {...messages.text} values={{name: account.name}}/></p>
              {error &&
                <Alert bsStyle='danger'>
                  {error}
                </Alert>
              }
              <ButtonToolbar className='pull-right'>
                <Button
                  type='button'
                  onClick={() => router.goBack()}
                  disabled={deleting}
                >
                  <FormattedMessage {...forms.cancel}/>
                </Button>
                <Button
                  bsStyle='danger'
                  onClick={this.acDelete}
                  disabled={deleting}
                >
                  <FormattedMessage {...messages.confirm}/>
                </Button>
              </ButtonToolbar>
            </div>
          </Grid>
        }
      </div>
    )
  }

  @autobind
  async acDelete() {
    const { bank, account, dispatch, router } = this.props
    try {
      this.setState({deleting: true, error: undefined})
      await dispatch(deleteAccount(bank!, account!))
      router.replace(DbInfo.to.home())
    } catch (err) {
      this.setState({deleting: false, error: err.message})
    }
  }
}

export const AccountDelete = compose(
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: state.db.current!,
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      account: selectAccount(state, props)
    })
  )
)(AccountDeleteComponent) as React.ComponentClass<{}>
