import * as R from 'ramda'
import * as React from 'react'
import Select from 'react-select'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, setDisplayName } from 'recompose'
import { Bank } from 'core/docs'
import { selectBanks } from 'core/selectors'
import { AppState } from 'core/state'
import { SelectOption } from './'

interface ConnectedProps {
  options: SelectOption[]
}

type EnhancedProps = ConnectedProps & Select.ReactSelectProps

const enhance = compose<EnhancedProps, Select.ReactSelectProps>(
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
  (state: AppState) => state.views.accounts,
  (banks, accountDocs): AccountSelectOption[] => {
    const accounts = R.flatten<AccountSelectOption>(banks.map(bank =>
      bank.doc.accounts.length ? [
        {
          value: bank.doc._id,
          label: bank.doc.name,
          fullName: '',
          disabled: true
        },
        ...bank.doc.accounts.map(accountId => {
          const account = accountId && accountDocs[accountId]
          return account && ({
            value: account.doc._id,
            label: account.doc.name,
            fullName: `${bank.doc.name} - ${account.doc.name}`
          })
        })
        .filter(account => !!account)
      ] : []
    ))
    return accounts
  }
)

const valueRenderer = (option: AccountSelectOption) => (
  <span>{option.fullName}</span>
)
