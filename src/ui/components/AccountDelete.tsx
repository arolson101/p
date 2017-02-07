import * as React from 'react'
import { Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { deleteAccount } from '../../actions'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, mapDispatchToProps } from '../../state'
import { forms } from './forms'
import { RouteProps } from './props'
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

interface EnhancedProps {
  confirmDelete: () => void
}

type AllProps = EnhancedProps & ReduxUIProps<UIState> & ConnectedProps & DispatchProps & RouteProps<Account.Params>

const enhance = compose<AllProps, RouteProps<Account.Params>>(
  setDisplayName('AccountDelete'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, DispatchProps, RouteProps<Account.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props),
      account: selectAccount(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ deleteAccount })
  ),
  ui<UIState, ConnectedProps & DispatchProps & RouteProps<Account.Params>, {}>({
    state: {
      error: undefined,
      deleting: false
    } as UIState
  }),
  withProps<EnhancedProps, ReduxUIProps<UIState> & ConnectedProps & DispatchProps & RouteProps<Account.Params>>(
  ({updateUI, bank, account, deleteAccount, router}) => ({
      confirmDelete: async () => {
        try {
          updateUI({error: undefined, deleting: true})
          await deleteAccount({bank, account})
          updateUI({deleting: false})
          router.replace(DbInfo.to.home())
        } catch (err) {
          updateUI({error: err.message, deleting: false})
        }
      }
    })
  )
)

export const AccountDelete = enhance(props => {
  const { router, account, ui: { error, deleting }, confirmDelete } = props
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
          onClick={() => router.goBack()}
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
