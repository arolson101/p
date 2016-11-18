import * as React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { AppState, AppDispatch, LoadAllDbs } from '../../modules'
import {Icon} from 'react-fa'

const icons = {
  newDb: {
    name: 'user-plus'
  },
  openDb: 'sign-in'
}

const translations = defineMessages({
  newDb: {
    id: 'newDb',
    defaultMessage: 'New Database',
    description: 'new database login page option'
  }
})

interface Props {
  allDbs: string[]
}

interface State {
}

export class LoginPageComponent extends React.Component<Props, State> {


  handleItemClick = (e: Event, args: { name: string }) => this.setState({ activeItem: args.name })

  render() {
    return (
      <ul>
        {this.props.allDbs.map(dbName =>
          <li key={dbName}>{dbName}</li>
        )}
        <li>
          <form onSubmit={()=>{}}>
            <label>name
              <input type='text'></input>
            </label>
            <label>password
              <input type='text'></input>
            </label>
            <button type='submit'>
              <Icon {...icons.newDb} />
              {' '}
              <FormattedMessage {...translations.newDb}/>
            </button>
          </form>
        </li>
      </ul>
    )
  }
}

export const LoginPage = connect(
  (state: AppState) => ({
    allDbs: state.db.all
  }),
  (dispatch: AppDispatch) => bindActionCreators( { }, dispatch ),
)(LoginPageComponent) as React.ComponentClass<Props>
