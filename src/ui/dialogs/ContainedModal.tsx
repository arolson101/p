import * as React from 'react'
import { Modal, ModalProps } from 'react-bootstrap'
import { compose, getContext } from 'recompose'
import { DialogContainer } from './DialogContainer'

type Props = ModalProps
type EnhancedProps = DialogContainer.Context & Props

const enhance = compose<EnhancedProps, Props>(
  getContext<DialogContainer.Context, Props>(
    DialogContainer.ContextTypes
  ),
)

export const ContainedModal = enhance(({ children, dialogContainer, ...props }) => {
  return (
    <Modal
      container={dialogContainer}
      {...props}>
      {children}
    </Modal>
  )
})
