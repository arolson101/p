import autobind = require('autobind-decorator')
import * as React from 'react'
import { Grid, Alert, Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { deleteInstitution } from '../../actions'
import { DbInfo, Institution } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { forms } from './forms'
import { IntlProps, RouteProps, DispatchProps } from './props'
import { selectDbInfo, selectInstitution } from './selectors'

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
    defaultMessage: "This will delete institution '{name}' and all its accounts.  Are you sure?"
  }
})

interface ConnectedProps {
  current: CurrentDb
  dbInfo?: DbInfo.Doc
  institution?: Institution.Doc
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & DispatchProps & RouteProps<Institution.Params>

interface State {
  error?: string
  deleting?: boolean
}

interface Deletion {
  _id: string
  _rev?: string
  _deleted: true
}

export class InDeleteComponent extends React.Component<AllProps, State> {
  state: State = {
    error: undefined,
    deleting: false
  }

  render() {
    const { router, institution } = this.props
    const { formatMessage } = this.props.intl
    const { error, deleting } = this.state
    return (
      <div>
        {institution &&
          <Grid>
            <Breadcrumbs {...this.props} page={formatMessage(messages.page)}/>
            <div>
              <p><FormattedMessage {...messages.text} values={{name: institution.name}}/></p>
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
    const { dbInfo, institution, dispatch, router } = this.props
    try {
      this.setState({deleting: true, error: undefined})
      await dispatch(deleteInstitution(institution!))
      router.replace(DbInfo.to.read(dbInfo!))
    } catch (err) {
      this.setState({deleting: false, error: err.message})
    }
  }
}

export const InDelete = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Institution.Params>): ConnectedProps => ({
      current: state.db.current!,
      dbInfo: selectDbInfo(state),
      institution: selectInstitution(state, props)
    })
  )
)(InDeleteComponent) as React.ComponentClass<Props>
