import * as React from 'react'
import { defineMessages } from 'react-intl'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs'
import { mapDispatchToProps } from '../../state'
import { BillForm, SubmitFunction } from './BillForm'
import { RouteProps } from './props'

const messages = defineMessages({
  page: {
    id: 'BillCreate.page',
    defaultMessage: 'Add Bill'
  }
})

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Bill.Doc>
}

type AllProps = EnhancedProps & RouteProps<Bill.Params>

const enhance = compose<AllProps, RouteProps<Bill.Params>>(
  setDisplayName('BillCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withHandlers<EnhancedProps, RouteProps<Bill.Params>>({
    onCancel: ({router}) => () => {
      router.goBack()
    },
    onSubmit: ({router}) => async (doc: Bill.Doc) => {
      router.replace(Bill.to.all())
    }
  })
)

export const BillCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  return (
    <BillForm title={messages.page} onSubmit={onSubmit} onCancel={onCancel} />
  )
})
