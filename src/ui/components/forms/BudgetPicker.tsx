import * as R from 'ramda'
import * as React from 'react'
import * as Select from 'react-select'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Budget } from '../../../docs/index'
import { AppState } from '../../../state/index'
import { SelectOption } from './index'

interface ConnectedProps {
  options: SelectOption[]
  budgets: Budget.View[]
}

interface Handlers {
  isValidNewOption: ({label}: {label?: string}) => boolean
  promptTextCreator: (label: string) => string
}

type AllProps = Handlers & ConnectedProps

const enhance = compose<AllProps, {}>(
  setDisplayName('BudgetPicker'),
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      options: categoryOptions(state),
      budgets: state.db.current!.view.budgets
    })
  ),
  withHandlers<Handlers, ConnectedProps>({
    isValidNewOption: props => ({label}: {label?: string}): boolean => {
      const { budget, category } = Budget.validateNewCategory(props.budgets, label)
      return !!budget && !!category
    },

    promptTextCreator: props => (label: string): string => {
      const { budget, category } = Budget.validateNewCategory(props.budgets, label)
      return `create category '${category}' in budget '${budget!.name}'`
    },

    newOptionCreator: props => (arg: { label: string, labelKey: string, valueKey: string }): SelectOption => {
      const { budget, category } = Budget.validateNewCategory(props.budgets, arg.label)
      if (budget) {
        const label = optionLabel(budget!, category)
        return {
          value: label,
          label
        }
      } else {
        return {
          value: arg.label,
          label: arg.label
        }
      }
    }
  })
)

export const BudgetPicker = enhance((props) => {
  return (
    <Select.Creatable
      matchProp='label'
      placeholder=''
      {...props}
    />
  )
})

const optionLabel = (budget: Budget.Doc, category: string): string => {
  return `${budget.name}: ${category}`
}

const categoryOptions = createSelector(
  (state: AppState) => state.db.current!.view.budgets,
  (budgets: Budget.View[]): SelectOption[] => {
    const options = R.flatten(budgets.map(budget =>
      budget.categories.length ? [
        ...budget.categories.map(category => ({
          value: category.doc._id,
          label: optionLabel(budget.doc, category.doc.name)
        }))
      ] : []
    ))
    return R.sortBy((option: SelectOption) => option.label, options)
  }
)
