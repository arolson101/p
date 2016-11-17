import * as React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { List } from 'semantic-ui-react'
import { AppState, AppDispatch, LoadAllDbs } from '../../modules'

const icons = {
  newDb: 'add user',
  openDb: 'sign in'
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

export const LoginPageComponent = (props: Props) => {
  return (
    <List selection celled verticalAlign='middle' size='massive'>
      {props.allDbs.map(db =>
        <List.Item key={db}>
          <List.Icon name={icons.openDb} />
          <List.Content>
            <List.Header>{db}</List.Header>
          </List.Content>
        </List.Item>
      )}

      <List.Item>
        <List.Icon name={icons.newDb} />
        <List.Content>
          <Link to='/new'>
            <FormattedMessage {...translations.newDb}/>
          </Link>
        </List.Content>
      </List.Item>
    </List>
  )
}

export const LoginPage = connect(
  (state: AppState) => ({
    allDbs: state.db.all
  }),
  (dispatch: AppDispatch) => bindActionCreators( { LoadAllDbs }, dispatch ),
)(LoginPageComponent) as React.ComponentClass<Props>
