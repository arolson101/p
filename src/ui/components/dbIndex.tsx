import Divider from 'material-ui/Divider'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import { List, ListItem } from 'material-ui/List'
import MenuItem from 'material-ui/MenuItem'
import { grey400 } from 'material-ui/styles/colors'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import Paper from 'material-ui/Paper'
import * as PouchDB from 'pouchdb-browser'
import * as React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { DbInfo } from '../../docs'
import { AppState, MetaDb } from '../../state'
import { Lookup } from '../../util'
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
    id: 'dbIndex.newDb',
    defaultMessage: 'New'
  },
  newDbDescription: {
    id: 'dbIndex.newDbDescription',
    defaultMessage: 'Create a new data store'
  }
})

const style = {
  paper: {
    display: 'inline-block',
    margin: '16px 32px 16px 0'
  }
}

const iconButtonElement = (
  <IconButton
    touch={true}
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
)

interface ConnectedProps {
  dbInfos: DbInfo.Cache
  metaDb: MetaDb
}

interface Props {}
type AllProps = RouteProps & ConnectedProps & Props

export const DbIndexComponent = (props: AllProps) => (
  <div>
    {props.dbInfos &&
      <Paper style={style.paper}>
        <List>
          {Lookup.map(props.dbInfos, dbInfo =>
            <ListItem
              key={dbInfo._id}
              primaryText={dbInfo.title}
              leftIcon={<FontIcon {...icons.openDb} />}
              containerElement={<Link to={DbInfo.path(dbInfo)}/>}
              rightIconButton={
                <IconMenu iconButtonElement={iconButtonElement}>
                  <MenuItem onTouchTap={() => {
                    props.metaDb.db.remove(dbInfo)
                    new PouchDB(dbInfo._id).destroy()
                  }}>Delete</MenuItem>
                </IconMenu>
              }
            />
          )}
          {Lookup.hasAny(props.dbInfos) &&
            <Divider/>
          }
          <ListItem
            primaryText={<FormattedMessage {...messages.newDb}/>}
            secondaryText={<p><FormattedMessage {...messages.newDbDescription}/></p>}
            secondaryTextLines={1}
            leftIcon={<FontIcon {...icons.newDb} />}
            containerElement={<Link to='/?create'/>}
          />
        </List>
      </Paper>
    }
  </div>
)

export const DbIndex = connect(
  (state: AppState): ConnectedProps => ({
    dbInfos: state.db.meta.infos,
    metaDb: state.db.meta
  })
)(DbIndexComponent) as React.ComponentClass<Props>
