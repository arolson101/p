import { Grid } from 'react-bootstrap'
import * as React from 'react'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Dispatch } from 'redux'
import { Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { Values, AccountForm, SubmitFunction } from './AccountForm'
import { RouteProps } from './props'
import { selectCurrentDb, selectBank, selectBankAccounts } from './selectors'

const messages = defineMessages({
  page: {
    id: 'acCreate.page',
    defaultMessage: 'Add Account'
  }
})

interface ConnectedProps {
  current: CurrentDb
  bank: Bank.View
  accounts: Account.View[]
  lang: string
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<Account.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: selectCurrentDb(state),
      lang: state.i18n.lang,
      bank: selectBank(state, props),
      accounts: selectBankAccounts(state, props)
    })
  ),
  withProps(({router}: AllProps): EnhancedProps => ({
    onCancel: () => {
      router.goBack()
    },
    onSubmit: async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
      const { current, lang } = props
      const bank = props.bank.doc

      const account: Account = {
        ...values,
        visible: true
      }

      const doc = Account.doc(bank, account, lang)
      const nextBank = { ...bank, accounts: [...bank.accounts, doc._id] }
      await current!.db.bulkDocs([doc, nextBank])

      router.replace(Account.to.view(doc))
    }
  }))
)

export const AccountCreate = enhance((props) => {
  const { bank, accounts, onSubmit, onCancel } = props
  return (
    <div>
      {bank &&
        <Grid>
          <Breadcrumbs {...props} page={messages.page}/>
          <AccountForm {...props} accounts={accounts} onSubmit={onSubmit} onCancel={onCancel}/>
        </Grid>
      }
    </div>
  )
})
