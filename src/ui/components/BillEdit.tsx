import * as React from 'react'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs/index'
import { AppState } from '../../state/index'
import { BillForm, SubmitFunction } from './BillForm'
import { RouteProps } from './props'
import { selectBill } from './selectors'

const messages = defineMessages({
  page: {
    id: 'BillEdit.page',
    defaultMessage: 'Edit Bill'
  }
})

interface ConnectedProps {
  bill: Bill.View
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Bill.Doc>
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<Bill.Params>

const enhance = compose<AllProps, RouteProps<Bill.Params>>(
  setDisplayName('BillEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, {}, RouteProps<Bill.Params>>(
    (state: AppState, props): ConnectedProps => ({
      bill: selectBill(state, props)
    }),
  ),
  withHandlers<EnhancedProps, ConnectedProps & RouteProps<Bill.Params>>({
    onCancel: ({history}) => () => {
      history.goBack()
    },
    onSubmit: ({history}) => async (doc: Bill.Doc) => {
      history.replace(Bill.to.all())
    }
  })
)

export const BillEdit = enhance((props) => {
  const { onSubmit, onCancel } = props
  return (
    <BillForm edit={props.bill} title={messages.page} onSubmit={onSubmit} onCancel={onCancel} />
  )
})
