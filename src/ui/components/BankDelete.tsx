import * as React from 'react'
import { Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { deleteBank } from '../../actions'
import { DbInfo, Bank } from '../../docs'
import { AppState, mapDispatchToProps } from '../../state'
import { withState2 } from '../enhancers'
import { forms } from './forms'
import { RouteProps } from './props'
import { selectBank } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inDelete.page',
    defaultMessage: 'Delete'
  },
  confirm: {
    id: 'inDelete.confirm',
    defaultMessage: 'Delete Institution'
  },
  text: {
    id: 'inDelete.text',
    defaultMessage: "This will delete bank '{name}' and all its accounts.  Are you sure?"
  }
})

interface ConnectedProps {
  bank: Bank.View
}

interface DispatchProps {
  deleteBank: deleteBank.Fcn
}

interface State {
  error?: string
  setError: (error?: string) => void

  deleting: boolean
  setDeleting: (deleting: boolean) => void
}

interface EnhancedProps {
  confirmDelete: () => void
}

type AllProps = EnhancedProps & State & ConnectedProps & DispatchProps & RouteProps<Bank.Params>

const enhance = compose<AllProps, RouteProps<Bank.Params>>(
  setDisplayName('BankDelete'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, DispatchProps, RouteProps<Bank.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ deleteBank })
  ),
  withState2<State, ConnectedProps & DispatchProps & RouteProps<Bank.Params>>(
    {
      error: undefined,
      deleting: false
    },
    {
      setError: 'error',
      setDeleting: 'deleting'
    }
  ),
  withProps<EnhancedProps, State & ConnectedProps & DispatchProps & RouteProps<Bank.Params>>(
    ({setDeleting, setError, bank, deleteBank, router}) => ({
      confirmDelete: async () => {
        try {
          setError(undefined)
          setDeleting(true)
          await deleteBank({bank})
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

export const BankDelete = enhance(props => {
  const { router, bank, error, deleting, confirmDelete } = props
  return (
    <div>
      <p><FormattedMessage {...messages.text} values={{name: bank.doc.name}}/></p>
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
  )
})
