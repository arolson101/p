import * as React from 'react'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank, Account } from '../../docs'
import { AppState, pushChanges, mapDispatchToProps } from '../../state'
import { Values, AccountForm, SubmitFunction } from './AccountForm'
import { RouteProps } from './props'
import { selectBank } from './selectors'

const messages = defineMessages({
  page: {
    id: 'AccountCreate.page',
    defaultMessage: 'Create Account'
  }
})

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
  onSubmit: SubmitFunction<Values>
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<Account.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, DispatchProps, RouteProps<Account.Params>>(
    (state: AppState, props) => ({
      lang: state.i18n.lang,
      bank: selectBank(state, props),
      accounts: selectBank(state, props).accounts
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, ConnectedProps & DispatchProps & RouteProps<Account.Params>>(
    ({router, pushChanges, lang, bank}) => ({
      onCancel: () => {
        router.goBack()
      },
      onSubmit: async (values: Values) => {
        const account: Account = {
          ...values,
          visible: true
        }

        const doc = Account.doc(bank.doc, account, lang)
        const nextBank: Bank.Doc = { ...bank.doc, accounts: [...bank.doc.accounts, doc._id] }
        await pushChanges({docs: [doc, nextBank]})

        router.replace(Account.to.view(doc))
      }
    })
  )
)

export const AccountCreate = enhance((props) => {
  const { accounts, onSubmit, onCancel } = props
  return (
    <AccountForm title={messages.page} accounts={accounts} onSubmit={onSubmit} onCancel={onCancel}/>
  )
})
