import { Grid } from 'react-bootstrap'
import * as React from 'react'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank, Account } from '../../docs'
import { AppState, pushChanges, mapDispatchToProps } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { RouteProps } from './props'
import { selectBank, selectAccount } from './selectors'
import { Values, AccountForm, SubmitFunction } from './AccountForm'

const messages = defineMessages({
  page: {
    id: 'acUpdate.page',
    defaultMessage: 'Edit'
  }
})

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
    <div>
      {bank && account &&
        <Grid>
          <Breadcrumbs {...props} page={messages.page}/>
          <AccountForm {...props} edit={account.doc} accounts={bank.accounts} onSubmit={onSubmit} onCancel={onCancel}/>
        </Grid>
      }
    </div>
  )
})
