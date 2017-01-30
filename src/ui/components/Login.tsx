import * as React from 'react'
import { Grid, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, withState } from 'recompose'
import { DbInfo } from '../../docs'
import { AppState } from '../../state'
import { LoginForm } from './LoginForm'
import { CreateForm } from './CreateForm'
import { RouteProps } from './props'

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

interface ConnectedProps {
  files: DbInfo[]
}

interface EnhancedProps {
  activeId: string
  setActiveId: (activeId: string) => void
  deselect: () => void
  onLogin: (dbInfo: DbInfo) => void
}

type AllProps = EnhancedProps & RouteProps<any> & ConnectedProps

const enhance = compose<AllProps, {}>(
  setDisplayName('Login'),
  connect(
    (state: AppState): ConnectedProps => ({
      files: state.db.files
    })
  ),
  withState('activeId', 'setActiveId', ''),
  withHandlers<AllProps,AllProps>({
    deselect: ({setActiveId}) => () => {
      setActiveId('')
    },
    onLogin: ({router}) => (dbInfo: DbInfo) => {
      router.push(DbInfo.to.home())
    }
  })
)

const activeProps = { bsStyle: 'info' }
const createId = '_create'

export const Login = enhance(({ files, router, activeId, setActiveId, deselect, onLogin }) => (
  <Grid>
    <div>
      <ListGroup>
        {files.map(file => {
          const active = (activeId === file.name)
          const props = active ? activeProps : {onClick: () => setActiveId(file.name)}
          return (
            <ListGroupItem
              key={file.name}
              {...props}
            >
              <h4><i {...icons.openDb}/> {file.name}</h4>
              {active &&
                <LoginForm
                  info={file}
                  onCancel={deselect}
                  onLogin={onLogin}
                />
              }
            </ListGroupItem>
          )
        })}
      </ListGroup>
      <ListGroup>
        <ListGroupItem
          {... (activeId === createId) ? activeProps : {onClick: () => setActiveId(createId)}}
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
