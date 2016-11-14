import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { AppState, AppDispatch, LoadAllDbs } from '../../modules'
import { Message, Icon, Button, List, Image } from 'semantic-ui-react'

interface Props {
  all: string[]
  LoadAllDbs: () => any
}

export const AppComponent = (props: Props) => {
  return (
    <div>app {props.all.join(', ')}

      <List selection divided verticalAlign='middle'>
        <List.Item>
          <Image avatar src='http://semantic-ui.com/images/avatar/small/helen.jpg' />
            <List.Content>
              <List.Header>Helen</List.Header>
            </List.Content>
        </List.Item>
        <List.Item>
          <Image avatar src='http://semantic-ui.com/images/avatar/small/christian.jpg' />
            <List.Content>
              <List.Header>Christian</List.Header>
            </List.Content>
        </List.Item>
        <List.Item>
          <Image avatar src='http://semantic-ui.com/images/avatar/small/daniel.jpg' />
            <List.Content>
              <List.Header>Daniel</List.Header>
            </List.Content>
        </List.Item>
      </List>

      <Button onClick={() => props.LoadAllDbs()}>load all dbs</Button>
    </div>
  )
}

export const App = connect(
  (state: AppState) => ({
    all: state.db.all
  }),
  (dispatch: AppDispatch) => bindActionCreators( { LoadAllDbs }, dispatch ),
)(AppComponent)
