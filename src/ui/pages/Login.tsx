import * as React from 'react'
import { Grid, Button, ButtonGroup, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { DbInfo } from 'core/docs'
import { AppState, mapDispatchToProps } from 'core/state'
import { showLoginDialog, showCreateDialog } from '../dialogs'

const icons = {
  newDb: {
    className: 'fa fa-user-plus'
  },
  openDb: {
    className: 'fa fa-sign-in'
  }
}

const messages = defineMessages({
  newDb: {
    id: 'login.newDb',
    defaultMessage: 'New'
  },
})

interface ConnectedProps {
  files: DbInfo[]
}

interface DispatchProps {
  showLoginDialog: typeof showLoginDialog
  showCreateDialog: typeof showCreateDialog
}

type EnhancedProps = ConnectedProps & DispatchProps

const wellStyles = {maxWidth: 400, margin: '0 auto 50px', padding: '50px'}

export const LoginComponent = ({ files, showLoginDialog, showCreateDialog }: EnhancedProps) => (
  <div>
    <div className='well' style={wellStyles}>
      <ButtonGroup vertical block bsSize='large'>
        {files.map(file => {
          return (
            <Button
              block
              key={file.name}
              onClick={() => showLoginDialog({info: file})}
            >
              <i {...icons.openDb}/>
              {' '}
              {file.name}
            </Button>
          )
        })}
        <br/>
        <Button
          block
          onClick={showCreateDialog}
        >
          <i {...icons.openDb}/>
          {' '}
          <FormattedMessage {...messages.newDb}/>
        </Button>
      </ButtonGroup>
    </div>
  </div>
)

export const LoginRoute = compose<EnhancedProps, RouteComponentProps<any>>(
  withRouter,
  connect<ConnectedProps, DispatchProps, {}>(
    (state: AppState): ConnectedProps => ({
      files: state.db.files
    }),
    mapDispatchToProps<DispatchProps>({ showLoginDialog, showCreateDialog })
  ),
)(LoginComponent)
