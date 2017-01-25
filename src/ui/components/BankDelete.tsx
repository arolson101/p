import autobind = require('autobind-decorator')
import * as React from 'react'
import { Grid, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { deleteBank } from '../../actions'
import { DbInfo, Bank } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { forms } from './forms'
import { RouteProps, DispatchProps } from './props'
import { selectDbInfo, selectBank } from './selectors'

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
  current: CurrentDb
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
}

type AllProps = ConnectedProps & DispatchProps & RouteProps<Bank.Params>

interface State {
  error?: string
  deleting?: boolean
}

interface Deletion {
  _id: string
  _rev?: string
  _deleted: true
}

export class BankDeleteComponent extends React.Component<AllProps, State> {
  state: State = {
    error: undefined,
    deleting: false
  }

  render() {
    const { router, bank } = this.props
    const { error, deleting } = this.state
    return (
      <div>
        {bank &&
          <Grid>
            <Breadcrumbs {...this.props} page={messages.page}/>
            <div>
              <p><FormattedMessage {...messages.text} values={{name: bank.name}}/></p>
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
                  onClick={this.inDelete}
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
  }

  @autobind
  async inDelete() {
    const { bank, dispatch, router } = this.props
    try {
      this.setState({deleting: true, error: undefined})
      await dispatch(deleteBank(bank!))
      router.replace(DbInfo.to.home())
    } catch (err) {
      this.setState({deleting: false, error: err.message})
    }
  }
}

export const BankDelete = compose(
  connect(
    (state: AppState, props: RouteProps<Bank.Params>): ConnectedProps => ({
      current: state.db.current!,
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props)
    })
  )
)(BankDeleteComponent) as React.ComponentClass<{}>
