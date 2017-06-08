import * as React from 'react'
import { defineMessages } from 'react-intl'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs/index'
import { BillForm } from './BillForm'
import { RouteProps } from './props'

const messages = defineMessages({
  page: {
    id: 'BillCreate.page',
    defaultMessage: 'Add Bill'
  }
})

interface Handlers {
  onCancel: () => void
  onSave: (doc: Bill.Doc) => void
}

type EnhancedProps = Handlers & RouteProps<Bill.Params>

const enhance = compose<EnhancedProps, RouteProps<Bill.Params>>(
  setDisplayName('BillCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  withHandlers<Handlers, RouteProps<Bill.Params>>({
    onCancel: ({history}) => () => {
      history.goBack()
    },
    onSave: ({history}) => async (doc: Bill.Doc) => {
      history.replace(Bill.to.all())
    }
  })
)

export const BillCreate = enhance((props) => {
  const { onSave, onCancel } = props
  return (
    <BillForm title={messages.page} onSave={onSave} onCancel={onCancel} />
  )
})
