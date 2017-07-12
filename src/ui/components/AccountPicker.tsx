import * as R from 'ramda'
import * as React from 'react'
import * as Select from 'react-select'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName } from 'recompose'
import { Bank } from '../../docs/index'
import { selectBanks } from '../../selectors'
import { AppState } from '../../state/index'
import { SelectOption } from './index'

interface ConnectedProps {
  options: SelectOption[]
}

type EnhancedProps = ConnectedProps

const enhance = compose<EnhancedProps, {}>(
  setDisplayName('AccountPicker'),
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      options: accountOptions(state),
    })
  )
)

export const AccountPicker = enhance((props) => {
  return (
    <Select
      className='select-grouped'
      matchProp='label'
      valueRenderer={valueRenderer}
      placeholder=''
      {...props}
    />
  )
})

interface AccountSelectOption extends SelectOption {
  fullName: string
}

const accountOptions = createSelector(
  (state: AppState) => selectBanks(state),
  (banks: Bank.View[] = []): AccountSelectOption[] => {
    const accounts = R.flatten<AccountSelectOption>(banks.map(bank =>
      bank.accounts.length ? [
        {
          value: bank.doc._id,
          label: bank.doc.name,
          fullName: '',
          disabled: true
        },
        ...bank.accounts.map(acct => ({
          value: acct._id,
          label: acct.name,
          fullName: `${bank.doc.name} - ${acct.name}`
        }))
      ] : []
    ))
    return accounts
  }
)

const valueRenderer = (option: AccountSelectOption) => (
  <span>{option.fullName}</span>
)
