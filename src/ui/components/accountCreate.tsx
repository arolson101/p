import { Grid } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { Values, AccountForm, SubmitFunction } from './accountForm'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectBank, selectBankAccounts } from './selectors'

const messages = defineMessages({
  page: {
    id: 'acCreate.page',
    defaultMessage: 'Add Account'
  }
})

interface ConnectedProps {
  current?: CurrentDb
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  accounts: Account.Doc[]
  lang: string
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = IntlProps & EnhancedProps & ConnectedProps & RouteProps<Account.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('AccountEdit'),
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: state.db.current,
      lang: state.i18n.lang,
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      accounts: selectBankAccounts(state, props)
    })
  ),
  withProps(({router}: AllProps): EnhancedProps => ({
    onCancel: () => {
      router.goBack()
    },
    onSubmit: async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
      const { current, router, lang } = props
      const bank = props.bank!

      const account: Account = {
        name: values.name,
        type: values.type,
        number: values.number,
        bankid: values.bankid,
        visible: true
      }

      const doc = Account.doc(bank, account, lang)
      bank.accounts.push(doc._id)
      await current!.db.bulkDocs([doc, bank])

      router.replace(Account.to.view(doc))
    }
  }))
)

export const AccountCreate = enhance((props) => {
  const { bank, accounts, onSubmit, onCancel } = props
  const { formatMessage } = props.intl
  return (
    <div>
      {bank &&
        <Grid>
          <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
          <AccountForm {...props} accounts={accounts} onSubmit={onSubmit} onCancel={onCancel}/>
        </Grid>
      }
    </div>
  )
})
