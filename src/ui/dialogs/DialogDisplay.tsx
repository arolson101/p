import * as PropTypes from 'prop-types'
import { Modal, ModalProps, PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
import * as React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, getContext, withHandlers, withPropsOnChange } from 'recompose'
import { Bank, Account } from 'core/docs'
import { Validator } from 'util/index'
import { AppState, closeDialog, mapDispatchToProps } from 'core/state'
import { AccountDialog, AccountDialogStatic } from './AccountDialog'
import { AccountDeleteDialog, AccountDeleteDialogStatic } from './AccountDeleteDialog'
import { BankDialog, BankDialogStatic } from './BankDialog'
import { BankDeleteDialog, BankDeleteDialogStatic } from './BankDeleteDialog'
import { BillDialog, BillDialogStatic } from './BillDialog'
import { CreateDbDialog, CreateDbDialogStatic } from './CreateDbDialog'
import { LoginDialog, LoginDialogStatic } from './LoginDialog'

interface ConnectedProps {
  dialog: string
  show: boolean
  dialogProps: any
}

interface DispatchProps {
  closeDialog: typeof closeDialog
}

type EnhancedProps = ConnectedProps & DispatchProps

const enhance = compose<EnhancedProps, {}>(
  setDisplayName('DialogDisplay'),
  connect<ConnectedProps, DispatchProps, {}>(
    (state: AppState): ConnectedProps => ({
      dialog: state.dialog.dialog,
      show: state.dialog.show,
      dialogProps: state.dialog.props
    }),
    mapDispatchToProps<DispatchProps>({ closeDialog })
  ),
)

export const DialogDisplay = enhance((props) => {
  const { dialog, show, dialogProps, closeDialog } = props
  const passedProps = { show, onHide: closeDialog, ...dialogProps }

  switch (dialog) {
    case AccountDialogStatic.dialog:
      return <AccountDialog {...passedProps}/>
    case AccountDeleteDialogStatic.dialog:
      return <AccountDeleteDialog {...passedProps}/>
    case BankDialogStatic.dialog:
      return <BankDialog {...passedProps}/>
    case BankDeleteDialogStatic.dialog:
      return <BankDeleteDialog {...passedProps}/>
    case BillDialogStatic.dialog:
      return <BillDialog {...passedProps}/>
    case CreateDbDialogStatic.dialog:
      return <CreateDbDialog {...passedProps}/>
    case LoginDialogStatic.dialog:
      return <LoginDialog {...passedProps}/>
    default:
      return null
  }
})
