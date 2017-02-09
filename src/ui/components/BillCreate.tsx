import * as React from 'react'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
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

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Bill.Doc>
}

type AllProps = EnhancedProps & RouteProps<Bill.Params>

const enhance = compose<AllProps, RouteProps<Bill.Params>>(
  setDisplayName('BillCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<{}, DispatchProps, RouteProps<Bill.Params>>(
    () => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withHandlers<EnhancedProps, DispatchProps & RouteProps<Bill.Params>>({
    onCancel: ({router}) => () => {
      router.goBack()
    },
    onSubmit: ({router, pushChanges}) => async (doc: Bill.Doc) => {
      await pushChanges({docs: [doc]})
      router.replace(Bill.to.all())
    }
  })
)

export const BillCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  return (
    <BillForm show={true} title={messages.page} onSubmit={onSubmit} onCancel={onCancel} />
  )
})
