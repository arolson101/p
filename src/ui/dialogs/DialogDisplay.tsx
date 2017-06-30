import * as PropTypes from 'prop-types'
import { Modal, ModalProps, PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
import * as React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, getContext, withHandlers, withPropsOnChange } from 'recompose'
import { Bank, Account } from '../../docs/index'
import { Validator } from '../../util/index'
import { AppState, closeDialog, mapDispatchToProps } from '../../state/index'
import { AccountDialog, AccountDialogStatic } from './AccountDialog'
import { BankDialog, BankDialogStatic } from './BankDialog'
import { BillDialog, BillDialogStatic } from './BillDialog'
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

  switch (dialog) {
    case AccountDialogStatic.dialog:
      return <AccountDialog show={show} onHide={closeDialog} {...dialogProps as any}/>
    case BankDialogStatic.dialog:
      return <BankDialog show={show} onHide={closeDialog} {...dialogProps as any}/>
    case BillDialogStatic.dialog:
      return <BillDialog show={show} onHide={closeDialog} {...dialogProps as any}/>
    case LoginDialogStatic.dialog:
      return <LoginDialog show={show} onHide={closeDialog} {...dialogProps as any}/>
    default:
      return null
  }
})
