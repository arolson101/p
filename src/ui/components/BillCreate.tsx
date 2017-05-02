import * as React from 'react'
import { defineMessages } from 'react-intl'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs/index'
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
  withRouter,
  withHandlers<EnhancedProps, RouteProps<Bill.Params>>({
    onCancel: ({history}) => () => {
      history.goBack()
    },
    onSubmit: ({history}) => async (doc: Bill.Doc) => {
      history.replace(Bill.to.all())
    }
  })
)

export const BillCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  return (
    <BillForm title={messages.page} onSubmit={onSubmit} onCancel={onCancel} />
  )
})
