import * as React from 'react'
import { Modal, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { replace } from 'react-router-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withState, withHandlers } from 'recompose'
import { deleteBank } from 'core'
import { DbInfo, Bank } from 'core/docs'
import { AppState, mapDispatchToProps, setDialog } from 'core/state'
import { forms } from '../components/forms'
import { ContainedModal } from './ContainedModal'

const messages = defineMessages({
  title: {
    id: 'BankDeleteDialog.title',
    defaultMessage: 'Delete'
  },
  confirm: {
    id: 'BankDeleteDialog.confirm',
    defaultMessage: 'Delete Institution'
  },
  text: {
    id: 'BankDeleteDialog.text',
    defaultMessage: "This will delete bank '{name}' and all its accounts.  Are you sure?"
  }
})

interface Params {
  bank: Bank.View
}

interface Props extends Params {
  show: boolean
  onHide: () => void
}

interface ConnectedProps {
}

interface DispatchProps {
  deleteBank: deleteBank.Fcn
  replace: (path: string) => void
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
  setDisplayName('BankDelete'),
  connect<ConnectedProps, DispatchProps, Props>(
    (state: AppState, props) => ({
    }),
    mapDispatchToProps<DispatchProps>({ deleteBank, replace })
  ),
  withState('error', 'setError', undefined),
  withState('deleting', 'setDeleting', false),
  withHandlers<State & ConnectedProps & DispatchProps & Props, Handlers>({
    confirmDelete: ({setError, setDeleting, bank, deleteBank, replace, onHide}) => async () => {
      try {
        setError(undefined)
        setDeleting(true)
        replace(Bank.to.all())
        await deleteBank({bank})
        setDeleting(false)
        onHide()
      } catch (err) {
        setError(err.message)
        setDeleting(false)
      }
    }
  })
)

export const BankDeleteDialog = enhance(props => {
  const { show, onHide, bank, error, deleting, replace, confirmDelete } = props
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
        <FormattedMessage {...messages.text} values={{name: bank.doc.name}}/>
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

export const BankDeleteDialogStatic = {
  dialog: 'BankDeleteDialog'
}

export const showBankDeleteDialog = (params: Params) => setDialog(BankDeleteDialogStatic.dialog, params)
