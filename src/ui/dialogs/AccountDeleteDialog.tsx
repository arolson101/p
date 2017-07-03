import * as React from 'react'
import { Modal, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { replace } from 'react-router-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { deleteAccount } from '../../actions/index'
import { DbInfo, Bank, Account } from '../../docs/index'
import { AppState, mapDispatchToProps, setDialog } from '../../state/index'
import { forms } from '../components/forms/index'
import { selectBank, selectAccount } from '../components/selectors'
import { ContainedModal } from './ContainedModal'

const messages = defineMessages({
  title: {
    id: 'AccountDeleteDialog.title',
    defaultMessage: 'Delete'
  },
  confirm: {
    id: 'AccountDeleteDialog.confirm',
    defaultMessage: 'Delete Account'
  },
  text: {
    id: 'AccountDeleteDialog.text',
    defaultMessage: "This will delete account '{name}' and all its transactions.  Are you sure?"
  }
})

type RouteProps = RouteComponentProps<Account.Params>

interface Params {
  bank: Bank.View
  account: Account.View
}

interface Props extends Params {
  show: boolean
  onHide: () => void
}

interface ConnectedProps {
}

interface DispatchProps {
  deleteAccount: deleteAccount.Fcn
  replace: (location: string) => void
}

interface UIState {
  error?: string
  deleting?: boolean
}

interface Handlers {
  confirmDelete: () => void
}

type EnhancedProps = Handlers & ReduxUIProps<UIState> & ConnectedProps & DispatchProps & RouteProps & Props

const enhance = compose<EnhancedProps, RouteProps & Props>(
  setDisplayName('AccountDelete'),
  withRouter,
  connect<ConnectedProps, DispatchProps, RouteProps & Props>(
    (state: AppState, props): ConnectedProps => ({
    }),
    mapDispatchToProps<DispatchProps>({ deleteAccount, replace })
  ),
  ui<UIState, ConnectedProps & DispatchProps & RouteProps & Props, {}>({
    state: {
      error: undefined,
      deleting: false
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & ConnectedProps & DispatchProps & RouteProps & Props>({
    confirmDelete: ({updateUI, bank, account, deleteAccount, replace, onHide}: any) => async () => {
      try {
        updateUI({error: undefined, deleting: true})
        replace(Bank.to.view(bank.doc))
        await deleteAccount({bank, account})
        updateUI({deleting: false})
        onHide()
      } catch (err) {
        updateUI({error: err.message, deleting: false})
      }
    }
  })
)

export const AccountDeleteDialog = enhance(props => {
  const { show, onHide, account, ui: { error, deleting }, confirmDelete } = props
  return (
    <ContainedModal
      show={show}
      onHide={onHide}
      backdrop='static'
      bsSize='large'
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...messages.title}/>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <FormattedMessage {...messages.text} values={{name: account.doc.name}}/>
        {error &&
          <Alert bsStyle='danger'>
            {error}
          </Alert>
        }
      </Modal.Body>

      <Modal.Footer>
        <ButtonToolbar className='pull-right'>
          <Button
            type='button'
            onClick={onHide}
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
      </Modal.Footer>
    </ContainedModal>
  )
})

export const AccountDeleteDialogStatic = {
  dialog: 'AccountDeleteDialog'
}

export const showAccountDeleteDialog = (params: Params) => setDialog(AccountDeleteDialogStatic.dialog, params)
