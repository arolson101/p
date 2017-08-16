import * as React from 'react'
import { Modal, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
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
  show: boolean
  onHide: () => void
}

interface ConnectedProps {
}

interface DispatchProps {
  deleteAccount: deleteAccount.Fcn
  replace: (location: string) => void
}

interface State {
  error?: string
  setError: (error?: string) => void
  deleting?: boolean
  setDeleting: (deleting: boolean) => void
}

interface Handlers {
  confirmDelete: () => void
}

type EnhancedProps = Handlers & State & ConnectedProps & DispatchProps & Props

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('AccountDelete'),
  connect<ConnectedProps, DispatchProps, Props>(
    (state: AppState, props): ConnectedProps => ({
    }),
    mapDispatchToProps<DispatchProps>({ deleteAccount, replace })
  ),
  withState('error', 'setError', undefined),
  withState('deleting', 'setDeleting', false),
  withHandlers<State & ConnectedProps & DispatchProps & Props, Handlers>({
    confirmDelete: ({bank, account, deleteAccount, replace, onHide, setError, setDeleting}) => async () => {
      try {
        setError(undefined)
        setDeleting(true)
        replace(Bank.to.view(bank.doc))
        await deleteAccount({bank, account})
        setDeleting(false)
        onHide()
      } catch (err) {
        setError(err.message)
        setDeleting(false)
      }
    }
  })
)

export const AccountDeleteDialog = enhance(props => {
  const { show, onHide, account, error, deleting, confirmDelete } = props
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
