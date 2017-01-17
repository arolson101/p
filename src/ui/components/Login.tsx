import * as React from 'react'
import { Grid, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, withState } from 'recompose'
import { DbInfo } from '../../docs'
import { AppState } from '../../state'
import { Lookup } from '../../util'
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
  dbInfos: DbInfo.Cache
}

interface EnhancedProps {
  activeId: string
  setActiveId: (activeId: string) => void
  onSelect: (e: any) => void
  deselect: () => void
  onLogin: (dbInfo: DbInfo.Doc) => void
}

type AllProps = EnhancedProps & RouteProps<any> & ConnectedProps

const enhance = compose<AllProps, {}>(
  setDisplayName('Login'),
  connect(
    (state: AppState): ConnectedProps => ({
      dbInfos: state.db.meta.infos
    })
  ),
  withState('activeId', 'setActiveId', ''),
  withHandlers({
    onSelect: (props: AllProps) => (e: number) => {
      // console.log('onSelect', e.target.parentElement.)
    },
    deselect: ({setActiveId}: AllProps) => () => {
      setActiveId('')
    },
    onLogin: ({router}: AllProps) => (dbInfo: DbInfo.Doc) => {
      router.push(DbInfo.to.view(dbInfo))
    }
  })
)

const activeProps = { bsStyle: 'info' }
const createId = '_create'

export const Login = enhance(({ dbInfos, router, activeId, setActiveId, onSelect, deselect, onLogin }) => (
  <Grid>
    {dbInfos &&
      <div>
        <ListGroup>
          {Lookup.map(dbInfos, dbInfo => {
            const active = (activeId === dbInfo._id)
            const props = active ? activeProps : {onClick: () => setActiveId(dbInfo._id)}
            return (
              <ListGroupItem
                key={dbInfo._id}
                {...props}
              >
                <h4><i {...icons.openDb}/> {dbInfo.title}</h4>
                {active &&
                  <LoginForm
                    dbDoc={dbInfo}
                    onCancel={deselect}
                    onLogin={onLogin}
                  />
                }
              </ListGroupItem>
            )
          })}
          {/*Lookup.hasAny(props.dbInfos) &&
            <Divider/>
          */}
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
    }
  </Grid>
))
