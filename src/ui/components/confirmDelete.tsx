import autobind = require('autobind-decorator')
import * as React from 'react'
import { Button, Modal } from 'react-bootstrap'
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
}

export class ConfirmDelete extends React.Component<Props, any> {
  state: State = {
    show: false
  }

  render() {
    const { show } = this.state
    const { event, title, body, confirm } = this.props
    const Component = this.props.component
    const eventProp = { [event]: this.open }
    return (
      <Component {...eventProp}>
        <Modal show={show} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{body}</Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}><FormattedMessage {...forms.cancel}/></Button>
            <Button onClick={this.confirm} bsStyle='danger'>{confirm}</Button>
          </Modal.Footer>
        </Modal>
        {this.props.children}
      </Component>
    )
  }

  @autobind
  open() {
    this.setState({show: true})
  }

  @autobind
  close() {
    this.setState({show: false})
  }

  @autobind
  confirm(e: React.SyntheticEvent<any>) {
    this.setState({show: false})
    this.props.onConfirmed(e)
  }
}
