import * as R from 'ramda'
import * as React from 'react'
import * as Select from 'react-select'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName } from 'recompose'
import { Bank } from '../../../docs'
import { AppState } from '../../../state'
import { SelectOption } from './'

interface ConnectedProps {
  options: SelectOption[]
}

type AllProps = ConnectedProps

const enhance = compose<AllProps, {}>(
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
  (state: AppState) => state.db.current!.view.banks,
  (banks: Bank.View[]): AccountSelectOption[] => {
    const accounts = R.flatten(banks.map(bank =>
      bank.accounts.length ? [
        {
          value: bank.doc._id,
          label: bank.doc.name,
          fullName: '',
          disabled: true
        },
        ...bank.accounts.map(acct => ({
          value: acct.doc._id,
          label: acct.doc.name,
          fullName: `${bank.doc.name} - ${acct.doc.name}`
        }))
      ] : []
    ))
    return accounts
  }
)

const valueRenderer = (option: AccountSelectOption) => (
  <span>{option.fullName}</span>
)
