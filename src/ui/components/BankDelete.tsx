import * as React from 'react'
import { Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { deleteBank } from '../../actions/index'
import { DbInfo, Bank } from '../../docs/index'
import { AppState, mapDispatchToProps } from '../../state/index'
import { forms } from './forms/index'
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

interface UIState {
  error?: string
  deleting?: boolean
}

interface Handlers {
  confirmDelete: () => void
}

type EnhancedProps = Handlers & ReduxUIProps<UIState> & ConnectedProps & DispatchProps & RouteProps<Bank.Params>

const enhance = compose<EnhancedProps, RouteProps<Bank.Params>>(
  setDisplayName('BankDelete'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, DispatchProps, RouteProps<Bank.Params>>(
    (state: AppState, props) => ({
      bank: selectBank(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ deleteBank })
  ),
  ui<UIState, ConnectedProps & RouteProps<any>, {}>({
    state: {
      error: undefined,
      deleting: false
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & ConnectedProps & DispatchProps & RouteProps<Bank.Params>>({
    confirmDelete: ({updateUI, bank, deleteBank, history}) => async () => {
      try {
        updateUI({error: undefined, deleting: true})
        await deleteBank({bank})
        updateUI({deleting: false})
        history.replace(DbInfo.to.home())
      } catch (err) {
        updateUI({error: err.message, deleting: false})
      }
    }
  })
)

export const BankDelete = enhance(props => {
  const { history, bank, ui: { error, deleting }, confirmDelete } = props
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
          onClick={() => history.goBack()}
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
