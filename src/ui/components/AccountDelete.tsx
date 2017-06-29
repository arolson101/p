import * as React from 'react'
import { Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { deleteAccount } from '../../actions/index'
import { DbInfo, Bank, Account } from '../../docs/index'
import { AppState, mapDispatchToProps } from '../../state/index'
import { forms } from './forms/index'
import { selectBank, selectAccount } from './selectors'

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

type RouteProps = RouteComponentProps<Account.Params>

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
}

interface DispatchProps {
  deleteAccount: deleteAccount.Fcn
}

interface UIState {
  error?: string
  deleting?: boolean
}

interface Handlers {
  confirmDelete: () => void
}

type EnhancedProps = Handlers & ReduxUIProps<UIState> & ConnectedProps & DispatchProps & RouteProps

const enhance = compose<EnhancedProps, RouteProps>(
  setDisplayName('AccountDelete'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, DispatchProps, RouteProps>(
    (state: AppState, props) => ({
      bank: selectBank(state, props),
      account: selectAccount(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ deleteAccount })
  ),
  ui<UIState, ConnectedProps & DispatchProps & RouteProps, {}>({
    state: {
      error: undefined,
      deleting: false
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & ConnectedProps & DispatchProps & RouteProps>({
    confirmDelete: ({updateUI, bank, account, deleteAccount, history}: any) => async () => {
      try {
        updateUI({error: undefined, deleting: true})
        await deleteAccount({bank, account})
        updateUI({deleting: false})
        history.replace(DbInfo.to.home())
      } catch (err) {
        updateUI({error: err.message, deleting: false})
      }
    }
  })
)

export const AccountDelete = enhance(props => {
  const { history, account, ui: { error, deleting }, confirmDelete } = props
  return (
    <div>
      <p><FormattedMessage {...messages.text} values={{name: account.doc.name}}/></p>
      {error &&
        <Alert bsStyle='danger'>
          {error}
        </Alert>
      }
      <ButtonToolbar className='pull-right'>
        <Button
          type='button'
          onClick={() => history.goBack()}
          disabled={deleting}
        >
          <FormattedMessage {...forms.cancel}/>
        </Button>
        <Button
          bsStyle='danger'
          onClick={confirmDelete}
          disabled={deleting}
        >
          <FormattedMessage {...messages.confirm}/>
        </Button>
      </ButtonToolbar>
    </div>
  )
})
