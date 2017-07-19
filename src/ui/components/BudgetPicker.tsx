import * as R from 'ramda'
import * as React from 'react'
import * as Select from 'react-select'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Budget } from '../../docs/index'
import { selectBudgets } from '../../selectors'
import { AppState } from '../../state/index'
import { SelectOption } from './index'

interface ConnectedProps {
  options: SelectOption[]
  budgets: Budget.Doc[]
}

interface Handlers {
  isValidNewOption: ({label}: {label?: string}) => boolean
  promptTextCreator: (label: string) => string
}

type EnhancedProps = Handlers & ConnectedProps

const enhance = compose<EnhancedProps, {}>(
  setDisplayName('BudgetPicker'),
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      options: categoryOptions(state),
      budgets: selectBudgets(state)
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
        const label = optionLabel(budget, category)
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
      {...props as any}
    />
  )
})

const optionLabel = (budget: Budget.Doc, category: string): string => {
  return `${budget.name}: ${category}`
}

const categoryOptions = createSelector(
  (state: AppState) => selectBudgets(state),
  (state: AppState) => state.docs.categories,
  (budgets: Budget.Doc[], categories): SelectOption[] => {
    const options = R.flatten<SelectOption>(budgets.map(budget =>
      budget.categories.length ? [
        ...budget.categories
        .map(categoryId => categories[categoryId])
        .filter(category => !!category)
        .map(category => ({
          value: category._id,
          label: optionLabel(budget, category.name)
        }))
      ] : []
    ))
    return R.sortBy((option: SelectOption) => option.label, options)
  }
)
