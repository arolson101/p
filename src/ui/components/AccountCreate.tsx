import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank, Account } from '../../docs/index'
import { AppState, pushChanges, mapDispatchToProps } from '../../state/index'
import { Values, AccountForm, SubmitHandler } from './AccountForm'
import { RouteProps } from './props'
import { selectBank } from './selectors'

interface ConnectedProps {
  bank: Bank.View
  accounts: Account.View[]
  lang: string
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitHandler<Values>
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<Account.Params>

const enhance = compose<AllProps, void>(
  setDisplayName('AccountCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, DispatchProps, RouteProps<Account.Params>>(
    (state: AppState, props) => ({
      lang: state.i18n.lang,
      bank: selectBank(state, props),
      accounts: selectBank(state, props).accounts
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, ConnectedProps & DispatchProps & RouteProps<Account.Params>>(
    ({history, pushChanges, lang, bank}) => ({
      onCancel: () => {
        history.goBack()
      },
      onSubmit: async (values: Values) => {
        const account: Account = {
          ...values,
          visible: true
        }

        const doc = Account.doc(bank.doc, account, lang)
        const nextBank: Bank.Doc = { ...bank.doc, accounts: [...bank.doc.accounts, doc._id] }
        await pushChanges({docs: [doc, nextBank]})

        history.replace(Account.to.view(doc))
      }
    })
  )
)

export const AccountCreate = enhance((props) => {
  const { accounts, onSubmit, onCancel } = props
  return (
    <AccountForm accounts={accounts} onSubmit={onSubmit} onCancel={onCancel}/>
  )
})
