import * as React from 'react'
import { Modal, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { replace } from 'react-router-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { deleteBank } from '../../actions/index'
import { DbInfo, Bank } from '../../docs/index'
import { AppState, mapDispatchToProps, setDialog } from '../../state/index'
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

interface UIState {
  error?: string
  deleting?: boolean
}

interface Handlers {
  confirmDelete: () => void
}

type EnhancedProps = Handlers & ReduxUIProps<UIState> & ConnectedProps & DispatchProps & Props

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('BankDelete'),
  withRouter,
  connect<ConnectedProps, DispatchProps, Props>(
    (state: AppState, props) => ({
    }),
    mapDispatchToProps<DispatchProps>({ deleteBank, replace })
  ),
  ui<UIState, ConnectedProps, {}>({
    state: {
      error: undefined,
      deleting: false
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & ConnectedProps & DispatchProps & Props>({
    confirmDelete: ({updateUI, bank, deleteBank, replace, onHide}) => async () => {
      try {
        updateUI({error: undefined, deleting: true})
        replace(Bank.to.all())
        await deleteBank({bank})
        updateUI({deleting: false})
        onHide()
      } catch (err) {
        updateUI({error: err.message, deleting: false})
      }
    }
  })
)

export const BankDeleteDialog = enhance(props => {
  const { show, onHide, bank, ui: { error, deleting }, replace, confirmDelete } = props
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
