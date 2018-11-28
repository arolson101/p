import * as React from 'react'
import { ButtonGroup } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { DbInfo } from 'core/docs'
import { AppState, Components } from 'core/state'
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

export namespace LoginComponent {
  export interface StateProps {
    UI: Components
    files: DbInfo[]
  }

  export interface DispatchProps {
    showLoginDialog: typeof showLoginDialog
    showCreateDialog: typeof showCreateDialog
  }

  export type ConnectedProps = StateProps & DispatchProps
  export type EnhancedProps = ConnectedProps
}

export const LoginComponent: React.SFC<LoginComponent.EnhancedProps> = ({ files, showLoginDialog, showCreateDialog, UI }) => (
  <UI.Page title={messages.title}>
    <ButtonGroup vertical block bsSize='large'>
      {files.map(file => {
        return (
          <UI.Button
            fullWidth
            key={file.name}
            id='open'
            onClick={() => showLoginDialog({ info: file })}
          >
            <i {...icons.openDb}/>
            {' '}
            {file.name}
          </UI.Button>
        )
      })}
      <br/>
      <UI.Button
        fullWidth
        id='new'
        onClick={showCreateDialog}
      >
        <i {...icons.openDb}/>
        {' '}
        <FormattedMessage {...messages.newDb}/>
      </UI.Button>
    </ButtonGroup>
  </UI.Page>
)

export const Login = connect<LoginComponent.StateProps, LoginComponent.DispatchProps>(
  (state: AppState) => ({
    files: state.db.files,
    UI: state.ui.Components
  }),
  ({ showLoginDialog, showCreateDialog })
)(LoginComponent)

export const LoginRoute = withRouter(Login)

LoginComponent.displayName = 'LoginComponent'
Login.displayName = 'Login'
LoginRoute.displayName = 'LoginRoute'
