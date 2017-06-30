import * as React from 'react'
import { Grid, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { DbInfo } from '../../docs/index'
import { AppState, mapDispatchToProps } from '../../state/index'
import { showLoginDialog } from '../dialogs/index'
import { CreateForm } from './CreateForm'

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
  newDbDescription: {
    id: 'login.newDbDescription',
    defaultMessage: 'Create a new data store'
  }
})

type RouteProps = RouteComponentProps<any>

interface ConnectedProps {
  files: DbInfo[]
}

interface DispatchProps {
  showLoginDialog: typeof showLoginDialog
}

interface UIState {
  activeId: string
}

interface Handlers {
  deselect: () => void
  onLogin: (dbInfo: DbInfo) => void
}

type EnhancedProps = Handlers & ReduxUIProps<UIState> & RouteProps & ConnectedProps & DispatchProps

const enhance = compose<EnhancedProps, undefined>(
  setDisplayName('Login'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, DispatchProps, RouteProps>(
    (state: AppState): ConnectedProps => ({
      files: state.db.files
    }),
    mapDispatchToProps<DispatchProps>({ showLoginDialog })
  ),
  ui<UIState, {}, {}>({
    key: 'Login',
    persist: true,
    state: {
      activeId: ''
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & RouteProps>({
    deselect: ({ updateUI }) => () => {
      updateUI({activeId: ''})
    },
  })
)

const activeProps = { bsStyle: 'info' }
const createId = '_create'

export const Login = enhance(({ files, ui: { activeId }, updateUI, deselect, onLogin, showLoginDialog }) => (
  <Grid>
    <div style={{padding: 50}}>
      <ListGroup>
        {files.map(file => {
          const active = (activeId === file.name)
          const props = active ? activeProps : {onClick: () => updateUI({activeId: file.name})}
          return (
            <ListGroupItem
              key={file.name}
              onClick={() => {
                console.log('showing login dialog')
                showLoginDialog({info: file})
              }}
            >
              <h4><i {...icons.openDb}/> {file.name}</h4>
              {/*{active &&
                <LoginForm
                  info={file}
                  onCancel={deselect}
                  onLogin={onLogin}
                />
              }*/}
            </ListGroupItem>
          )
        })}
      </ListGroup>
      <ListGroup>
        <ListGroupItem
          {... (activeId === createId) ? activeProps : {onClick: () => updateUI({activeId: createId})}}
        >
          <h4><i {...icons.openDb}/> <FormattedMessage {...messages.newDb}/></h4>
          <p><FormattedMessage {...messages.newDbDescription}/></p>
          {(activeId === createId) &&
            <CreateForm
              onCancel={deselect}
              onCreate={onLogin}
            />
          }
        </ListGroupItem>
      </ListGroup>
    </div>
  </Grid>
))
