import * as React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank, Account } from '../../docs/index'
import { AppState, pushChanges, mapDispatchToProps } from '../../state/index'
import { RouteProps } from './props'
import { selectBank, selectAccount } from './selectors'
import { Values, AccountForm, SubmitFunction } from './AccountForm'

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = EnhancedProps & ConnectedProps & DispatchProps & RouteProps<Account.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, DispatchProps, RouteProps<Account.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props),
      account: selectAccount(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, ConnectedProps & DispatchProps & RouteProps<Account.Params>>(({router, pushChanges, account}) => ({
    onCancel: () => {
      router.goBack()
    },
    onSubmit: async (values: Values) => {
      const doc: Account.Doc = {
        ...account.doc,
        ...values
      }
      await pushChanges({docs: [doc]})

      router.replace(Account.to.view(doc))
    }
  }))
)

export const AccountEdit = enhance(props => {
  const { bank, account, onSubmit, onCancel } = props
  return (
    <AccountForm edit={account.doc} accounts={bank.accounts} onSubmit={onSubmit} onCancel={onCancel}/>
  )
})
