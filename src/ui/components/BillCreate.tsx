import * as React from 'react'
import { Grid, Modal, ModalProps } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs'
import { pushChanges, mapDispatchToProps } from '../../state'
import { BillForm, SubmitFunction } from './BillForm'
import { RouteProps } from './props'

const messages = defineMessages({
  page: {
    id: 'BillCreate.page',
    defaultMessage: 'Add Bill'
  }
})

type Props = ModalProps

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Bill.Doc>
}

type AllProps = EnhancedProps & RouteProps<Bill.Params> & Props

const enhance = compose<AllProps, Props>(
  setDisplayName('BillCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<{}, DispatchProps, RouteProps<Bill.Params>>(
    () => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, DispatchProps & RouteProps<Bill.Params>>(
    ({router, pushChanges}) => ({
      onCancel: () => {
        router.goBack()
      },
      onSubmit: async (doc: Bill.Doc) => {
        await pushChanges({docs: [doc]})
        router.replace(Bill.to.all())
      }
    })
  )
)

export const BillCreate = enhance((props) => {
  const { show, onHide, onSubmit, onCancel } = props
  console.log('show:', show)
  return (
    <Modal show={show} onHide={onHide} bsSize='large'>
      <Modal.Header closeButton>
        <Modal.Title>
          <FormattedMessage {...messages.page}/>
        </Modal.Title>
      </Modal.Header>
      <BillForm onSubmit={onSubmit} onCancel={onHide as () => void} />
    </Modal>
  )
})
