import * as React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Budget } from '../../docs'
import { pushChanges, mapDispatchToProps } from '../../state'
import { BudgetForm, SubmitFunction } from './BudgetForm'
import { RouteProps } from './props'

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
    <BudgetForm onSubmit={onSubmit} onCancel={onCancel} />
  )
})
