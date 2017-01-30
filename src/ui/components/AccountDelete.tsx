import * as React from 'react'
import { Grid, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withState, withProps } from 'recompose'
import { deleteAccount } from '../../actions'
import { DbInfo, Bank, Account } from '../../docs'
import { AppState, mapDispatchToProps } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { forms } from './forms'
import { RouteProps } from './props'
import { selectBank, selectAccount } from './selectors'

const messages = defineMessages({
  page: {
    id: 'acDelete.page',
    defaultMessage: 'Delete'
  },
  confirm: {
    id: 'acDelete.confirm',
    defaultMessage: 'Delete Account'
  },
  text: {
    id: 'acDelete.text',
    defaultMessage: "This will delete account '{name}' and all its transactions.  Are you sure?"
  }
})

interface ConnectedProps {
  bank: Bank.View
  account: Account.View
}

interface DispatchProps {
  deleteAccount: deleteAccount.Fcn
}

interface ErrorState {
  error?: string
  setError: (error?: string) => void
}

interface DeletingState {
  deleting: boolean
  setDeleting: (deleting: boolean) => void
}

interface EnhancedProps {
  confirmDelete: () => void
}

type AllProps = EnhancedProps & DeletingState & ErrorState & ConnectedProps & DispatchProps & RouteProps<Account.Params>

const enhance = compose<AllProps, RouteProps<Account.Params>>(
  setDisplayName('AccountDelete'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, DispatchProps, RouteProps<Account.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props),
      account: selectAccount(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ deleteAccount })
  ),
  withState<ErrorState & ConnectedProps & DispatchProps & RouteProps<Account.Params>>(
    'error', 'setError', undefined
  ),
  withState<DeletingState & ErrorState & ConnectedProps & DispatchProps & RouteProps<Account.Params>>(
    'deleting', 'setDeleting', false
  ),
  withProps<EnhancedProps, DeletingState & ErrorState & ConnectedProps & DispatchProps & RouteProps<Account.Params>>(
  ({setDeleting, setError, bank, account, deleteAccount, router}) => ({
      confirmDelete: async () => {
        try {
          setError(undefined)
          setDeleting(true)
          await deleteAccount({bank, account})
          setDeleting(false)
          router.replace(DbInfo.to.home())
        } catch (err) {
          setDeleting(false)
          setError(err.message)
        }
      }
    })
  )
)

export const AccountDelete = enhance(props => {
  const { router, account, error, deleting, confirmDelete } = props
  return (
    <div>
      {account &&
        <Grid>
          <Breadcrumbs page={messages.page}/>
          <div>
            <p><FormattedMessage {...messages.text} values={{name: account.doc.name}}/></p>
            {error &&
              <Alert bsStyle='danger'>
                {error}
              </Alert>
            }
            <ButtonToolbar className='pull-right'>
              <Button
                type='button'
                onClick={() => router.goBack()}
                disabled={deleting}
              >
                <FormattedMessage {...forms.cancel}/>
              </Button>
              <Button
                bsStyle='danger'
                onClick={confirmDelete}
                disabled={deleting}
              >
                <FormattedMessage {...messages.confirm}/>
              </Button>
            </ButtonToolbar>
          </div>
        </Grid>
      }
    </div>
  )
})
