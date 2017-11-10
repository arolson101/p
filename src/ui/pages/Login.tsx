import * as React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose } from 'recompose'
import { DbInfo } from 'core/docs'
import { AppState, mapDispatchToProps } from 'core/state'
import { UI } from 'ui2'
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
  title: {
    id: 'login.title',
    defaultMessage: 'Login'
  },
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

const wellStyles = { maxWidth: 400, margin: '0 auto 50px', padding: '50px' }

export const LoginComponent: SFC<EnhancedProps, UI.Context> = ({ files, showLoginDialog, showCreateDialog }, { UI }) => (
  <UI.Page title={messages.title}>
    <div className='well' style={wellStyles}>
      <ButtonGroup vertical block bsSize='large'>
        {files.map(file => {
          return (
            <Button
              block
              key={file.name}
              id='open'
              onClick={() => showLoginDialog({ info: file })}
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
          id='new'
          onClick={showCreateDialog}
        >
          <i {...icons.openDb}/>
          {' '}
          <FormattedMessage {...messages.newDb}/>
        </Button>
      </ButtonGroup>
    </div>
  </UI.Page>
)

LoginComponent.contextTypes = UI.contextTypes

export const LoginRoute = compose<EnhancedProps, RouteComponentProps<any>>(
  withRouter,
  connect<ConnectedProps, DispatchProps, {}>(
    (state: AppState): ConnectedProps => ({
      files: state.db.files
    }),
    mapDispatchToProps<DispatchProps>({ showLoginDialog, showCreateDialog })
  ),
)(LoginComponent)
