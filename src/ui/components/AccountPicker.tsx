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
  (state: AppState) => state.docs.accounts,
  (banks, accountDocs): AccountSelectOption[] => {
    const accounts = R.flatten<AccountSelectOption>(banks.map(bank =>
      bank.accounts.length ? [
        {
          value: bank._id,
          label: bank.name,
          fullName: '',
          disabled: true
        },
        ...bank.accounts.map(accountId => {
          const account = accountId && accountDocs[accountId]
          return account && ({
            value: account._id,
            label: account.name,
            fullName: `${bank.name} - ${account.name}`
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
