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
import { Link } from 'react-router'
import { DbInfo } from '../../docs'
import { Lookup } from '../../util'
import { RootProps } from './root'

const icons = {
  newDb: {
    className: 'fa fa-user-plus'
  },
  openDb: {
    className: 'fa fa-sign-in'
  }
}

const translations = defineMessages({
  newDb: {
    id: 'newDb',
    defaultMessage: 'New'
  },
  newDbDescription: {
    id: 'newDbDescription',
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

export const DbIndex = (props: RootProps) => (
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
                    props.metaDb.handle.remove(dbInfo)
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
            primaryText={<FormattedMessage {...translations.newDb}/>}
            secondaryText={<p><FormattedMessage {...translations.newDbDescription}/></p>}
            secondaryTextLines={1}
            leftIcon={<FontIcon {...icons.newDb} />}
            containerElement={<Link to='/?create'/>}
          />
        </List>
      </Paper>
    }
  </div>
)
