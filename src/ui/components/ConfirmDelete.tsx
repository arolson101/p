import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
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

interface UIState {
  show: boolean
}

interface Handlers {
  onOpen: () => void
  onClose: () => void
  onConfirm: (e: React.SyntheticEvent<any>) => void
}

type AllProps = Handlers & ReduxUIProps<UIState> & Props

const enhance = compose<AllProps, Props>(
  setDisplayName('ConfirmDelete'),
  onlyUpdateForPropTypes,
  setPropTypes({
    component: PropTypes.func.isRequired,
    event: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    confirm: PropTypes.string.isRequired,
    onConfirmed: PropTypes.func.isRequired,
  } as PropTypes<Props>),
  ui<UIState, Props, {}>({
    state: {
      show: false
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & Props>({
    onOpen: ({updateUI}) => () => {
      updateUI({show: true})
    },
    onClose: ({updateUI}) => () => {
      updateUI({show: false})
    },
    onConfirm: ({updateUI, onConfirmed}) => (e: React.SyntheticEvent<any>) => {
      updateUI({show: false})
      onConfirmed(e)
    }
  })
)

export const ConfirmDelete = enhance(props => {
  const { component: Component, onOpen, onClose, onConfirm, ui: { show }, event, title, body, confirm } = props
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
