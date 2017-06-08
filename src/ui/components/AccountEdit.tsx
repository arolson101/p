import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank, Account } from '../../docs/index'
import { AppState, pushChanges, mapDispatchToProps } from '../../state/index'
import { RouteProps } from './props'
import { selectBank, selectAccount } from './selectors'
import { Values, AccountForm, SubmitHandler } from './AccountForm'

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface Handlers {
  onCancel: () => void
  onSubmit: SubmitHandler<Values>
}

type EnhancedProps = Handlers & ConnectedProps & DispatchProps & RouteProps<Account.Params>

const enhance = compose<EnhancedProps, void>(
  setDisplayName('AccountEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, DispatchProps, RouteProps<Account.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props),
      account: selectAccount(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withHandlers<Handlers, ConnectedProps & DispatchProps & RouteProps<Account.Params>>({
    onCancel: ({history}) => () => {
      history.goBack()
    },

    onSubmit: ({history, pushChanges, account}) => async (values: Values) => {
      const doc: Account.Doc = {
        ...account.doc,
        ...values
      }
      await pushChanges({docs: [doc]})

      history.replace(Account.to.view(doc))
    }
  })
)

export const AccountEdit = enhance(props => {
  const { bank, account, onSubmit, onCancel } = props
  return (
    <AccountForm edit={account.doc} accounts={bank.accounts} onSubmit={onSubmit} onCancel={onCancel}/>
  )
})
