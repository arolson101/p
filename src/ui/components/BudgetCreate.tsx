import * as React from 'react'
import { Modal } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Budget } from '../../docs'
import { pushChanges, mapDispatchToProps } from '../../state'
import { BudgetForm, SubmitFunction } from './BudgetForm'
import { RouteProps } from './props'

const messages = defineMessages({
  page: {
    id: 'BudgetCreate.page',
    defaultMessage: 'Add Budget'
  }
})

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Budget.Doc>
}

type AllProps = EnhancedProps & RouteProps<Budget.Params>

const enhance = compose<AllProps, RouteProps<Budget.Params>>(
  setDisplayName('BudgetCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<{}, DispatchProps, RouteProps<Budget.Params>>(
    () => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withHandlers<EnhancedProps, DispatchProps & RouteProps<Budget.Params>>({
    onCancel: ({router}) => () => {
      router.goBack()
    },
    onSubmit: ({router, pushChanges}) => async (doc: Budget.Doc) => {
      await pushChanges({docs: [doc]})
      router.replace(Budget.to.all())
    }
  })
)

export const BudgetCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  return (
    <Modal show={true} onHide={onCancel} bsSize='large'>
      <BudgetForm title={messages.page} onSubmit={onSubmit} onCancel={onCancel} />
    </Modal>
  )
})