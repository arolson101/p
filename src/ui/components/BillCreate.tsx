import * as React from 'react'
import { Grid, Modal, ModalProps } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs'
import { pushChanges, mapDispatchToProps } from '../../state'
import { BillForm, SubmitFunction } from './BillForm'

const messages = defineMessages({
  page: {
    id: 'BillCreate.page',
    defaultMessage: 'Add Bill'
  }
})

interface Props {
  onHide: Function
  show: boolean
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Bill.Doc>
}

type AllProps = EnhancedProps & Props

const enhance = compose<AllProps, Props>(
  setDisplayName('BillCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired
  } as PropTypes<Props>),
  connect<{}, DispatchProps, Props>(
    () => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withHandlers<EnhancedProps, DispatchProps & Props>({
    onCancel: ({onHide}) => () => {
      onHide()
    },
    onSubmit: ({onHide, pushChanges}) => async (doc: Bill.Doc) => {
      await pushChanges({docs: [doc]})
      onHide()
    }
  })
)

export const BillCreate = enhance((props) => {
  const { show, onHide, onSubmit, onCancel } = props
  return (
    <Modal show={show} onHide={onHide} bsSize='large'>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...messages.page}/>
        </Modal.Title>
      </Modal.Header>
      <BillForm onSubmit={onSubmit} onCancel={onCancel} />
    </Modal>
  )
})
