import * as React from 'react'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs/index'
import { AppState } from '../../state/index'
import { BillForm } from './BillForm'
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

interface Handlers {
  onCancel: () => void
  onSave: (doc: Bill.Doc) => void
}

type EnhancedProps = Handlers & ConnectedProps & RouteProps<Bill.Params>

const enhance = compose<EnhancedProps, RouteProps<Bill.Params>>(
  setDisplayName('BillEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, {}, RouteProps<Bill.Params>>(
    (state: AppState, props): ConnectedProps => ({
      bill: selectBill(state, props)
    }),
  ),
  withHandlers<Handlers, ConnectedProps & RouteProps<Bill.Params>>({
    onCancel: ({history}) => () => {
      history.goBack()
    },
    onSave: ({history}) => async (doc: Bill.Doc) => {
      history.replace(Bill.to.all())
    }
  })
)

export const BillEdit = enhance((props) => {
  const { onSave, onCancel } = props
  return (
    <BillForm edit={props.bill} title={messages.page} onSave={onSave} onCancel={onCancel} />
  )
})
