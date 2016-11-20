import * as React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { AppState, AppDispatch } from '../../modules'
import Paper from 'material-ui/Paper'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import FontIcon from 'material-ui/FontIcon'
import Divider from 'material-ui/Divider'

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
    defaultMessage: 'Create',
    description: 'new database login page option'
  }
})

interface Props {
  allDbs: string[]
}

interface State {
}

const style = {
  display: 'inline-block',
  margin: '16px 32px 16px 0'
}

export class LoginPageComponent extends React.Component<Props, State> {

  handleItemClick = (e: Event, args: { name: string }) => this.setState({ activeItem: args.name })

  render() {
    return (
      <div>
        <Paper style={style}>
          <Menu>
            {this.props.allDbs.map(dbName =>
              <MenuItem
                key={dbName}
                primaryText={dbName}
                leftIcon={<FontIcon {...icons.openDb} />}
              />
            )}
            {this.props.allDbs.length &&
              <Divider/>
            }
            <MenuItem
              primaryText={<FormattedMessage {...translations.newDb}/>}
              leftIcon={<FontIcon {...icons.newDb} />}
              onTouchTap={() => console.log('item')}
            />
          </Menu>
        </Paper>
      </div>
    )
  }
}

export const LoginPage = connect(
  (state: AppState) => ({
    allDbs: state.db.all
  }),
  (dispatch: AppDispatch) => bindActionCreators( { }, dispatch ),
)(LoginPageComponent) as React.ComponentClass<Props>
