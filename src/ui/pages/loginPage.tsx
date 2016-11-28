import Divider from 'material-ui/Divider'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import { List, ListItem } from 'material-ui/List'
import MenuItem from 'material-ui/MenuItem'
import { grey400 } from 'material-ui/styles/colors'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import Paper from 'material-ui/Paper'
import * as React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
// import { Link } from 'react-router'
import { createSelector } from 'reselect'
import { AppState, historyAPI } from '../../modules'
import { promisedConnect } from '../../util'

interface Doc {
  _id: string
  name: string
}

interface Props {
}

interface PromisedProps {
  allDbs: Promise<string[]>
}

interface ResolvedProps {
  allDbs?: string[]
}

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

const rightIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>Delete</MenuItem>
  </IconMenu>
)

export const LoginPageComponent = (props: ResolvedProps & Props) => (
  <div>
    {props.allDbs &&
      <Paper style={style.paper}>
        <List>
          {props.allDbs.map(dbName =>
            <ListItem
              key={dbName}
              primaryText={dbName}
              leftIcon={<FontIcon {...icons.openDb} />}
              rightIconButton={rightIconMenu}
            />
          )}
          {props.allDbs.length > 0 &&
            <Divider/>
          }
          <ListItem
            primaryText={<FormattedMessage {...translations.newDb}/>}
            secondaryText={<p><FormattedMessage {...translations.newDbDescription}/></p>}
            secondaryTextLines={1}
            leftIcon={<FontIcon {...icons.newDb} />}
            onTouchTap={() => historyAPI.push('/create')}
          />
        </List>
      </Paper>
    }
  </div>
)

const queryAllDbs = createSelector(
  (state: AppState) => state.db.meta!,
  async (meta) => {
    const docs = await meta.handle.allDocs({include_docs: true})
    const names = docs.rows.map(row => (row.doc as Doc).name)
    return names
  }
)

export const LoginPage = promisedConnect(
  (state: AppState): PromisedProps => ({
    allDbs: queryAllDbs(state)
  })
)(LoginPageComponent) as React.ComponentClass<Props>
