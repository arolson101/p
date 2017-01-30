import * as React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { compose, setDisplayName, withState, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { FormattedMessage } from 'react-intl'
import { forms } from './forms'

interface Props {
  component: any
  event: string
  title: string
  body: string
  confirm: string
  onConfirmed: React.EventHandler<any>
}

interface State {
  show: boolean
  setShow: (show: boolean) => void
}

interface Handlers {
  onOpen: () => void
  onClose: () => void
  onConfirm: (e: React.SyntheticEvent<any>) => void
}

type AllProps = Handlers & State & Props

const enhance = compose<AllProps, Props>(
  setDisplayName('ConfirmDelete'),
  onlyUpdateForPropTypes,
  setPropTypes({
    component: React.PropTypes.func.isRequired,
    event: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    body: React.PropTypes.string.isRequired,
    confirm: React.PropTypes.string.isRequired,
    onConfirmed: React.PropTypes.func.isRequired,
  } as PropTypes<Props>),
  withState('show', 'setShow', false),
  withHandlers<Handlers, State & Props>({
    onOpen: ({setShow}) => () => {
      setShow(true)
    },
    onClose: ({setShow}) => () => {
      setShow(false)
    },
    onConfirm: ({setShow, onConfirmed}) => (e: React.SyntheticEvent<any>) => {
      setShow(false)
      onConfirmed(e)
    }
  })
)

export const ConfirmDelete = enhance(props => {
  const { component: Component, onOpen, onClose, onConfirm, show, event, title, body, confirm } = props
  const eventProp = { [event]: onOpen }
  return (
    <Component {...eventProp}>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{body}</Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}><FormattedMessage {...forms.cancel}/></Button>
          <Button onClick={onConfirm} bsStyle='danger'>{confirm}</Button>
        </Modal.Footer>
      </Modal>
      {props.children}
    </Component>
  )
})
