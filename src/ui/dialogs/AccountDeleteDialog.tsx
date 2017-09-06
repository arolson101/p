import * as React from 'react'
import { Modal, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { replace } from 'react-router-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withState, withHandlers } from 'recompose'
import { deleteAccount } from 'core'
import { DbInfo, Bank, Account } from 'core/docs'
import { AppState, mapDispatchToProps, setDialog } from 'core/state'
import { forms } from '../components/forms'
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

interface Params {
  bank: Bank.View
  account: Account.View
}

interface Props extends Params {
  onHide: () => void
}

interface ConnectedProps {
  error?: Error
  deleting?: boolean
}

interface DispatchProps {
  deleteAccount: deleteAccount.Fcn
  replace: (location: string) => void
}

interface Handlers {
  handleDelete: () => void
}

type EnhancedProps = ConnectedProps & DispatchProps & Props

const enhance = compose<EnhancedProps & Handlers, EnhancedProps>(
  withHandlers<ConnectedProps & DispatchProps & Props, Handlers>({
    handleDelete: ({bank, account, deleteAccount, replace, onHide}) => async () => {
      const success = await deleteAccount({bank, account})
      if (success) {
        replace(Bank.to.view(bank.doc))
      }
    }
  })
)

export const AccountDeleteDialogComponent = enhance(props => {
  const { onHide, account, error, deleting, handleDelete } = props
  return (
    <div>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...messages.title}/>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <FormattedMessage {...messages.text} values={{name: account.doc.name}}/>
        {error &&
          <Alert bsStyle='danger'>
            {error.message}
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
            onClick={handleDelete}
            disabled={deleting}
          >
            <FormattedMessage {...messages.confirm}/>
          </Button>
        </ButtonToolbar>
      </Modal.Footer>
    </div>
  )
})

export const AccountDeleteDialog = connect<ConnectedProps, DispatchProps, Props>(
  (state: AppState, props): ConnectedProps => ({
    error: state.ui.accountDelete.error,
    deleting: state.ui.accountDelete.deleting,
  }),
  mapDispatchToProps<DispatchProps>({ deleteAccount, replace })
)(AccountDeleteDialogComponent)

export const AccountDeleteDialogStatic = {
  dialog: 'AccountDeleteDialog'
}

export const showAccountDeleteDialog = (params: Params) => setDialog(AccountDeleteDialogStatic.dialog, params)
