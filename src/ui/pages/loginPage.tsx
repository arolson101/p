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
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { AppState, AppDispatch, history } from '../../modules'

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

interface ConnectedProps {
  allDbs: string[]
}

interface Props {
}

const style = {
  display: 'inline-block',
  margin: '16px 32px 16px 0'
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

export const LoginPageComponent = (props: Props & ConnectedProps) => (
  <div>
    <Paper style={style}>
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
          onTouchTap={() => history.push('/create')}
        />
      </List>
    </Paper>
  </div>
)

export const LoginPage = connect(
  (state: AppState): ConnectedProps => ({
    allDbs: state.db.all
  }),
  (dispatch: AppDispatch) => bindActionCreators( { }, dispatch ),
)(LoginPageComponent) as React.ComponentClass<Props>
