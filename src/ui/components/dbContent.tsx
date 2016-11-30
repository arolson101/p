import * as React from 'react'
import { connect } from 'react-redux'
import { AppState, OpenDb } from '../../modules'
import { DbLogin } from './dbLogin'

interface Props {
}

interface ConnectedProps {
  current?: OpenDb<any>
}

interface RouteProps {
  params: {
    db: string
  }
}

export const DbContentComponent = (props: Props & ConnectedProps & RouteProps) => {
  if (!props.current) {
    return <DbLogin {...props}/>
  }

  return (
    <div>db is {props.params.db}
    </div>
  )
}

export const DbContent = connect(
  (state: AppState): ConnectedProps => ({
    current: state.db.current
  })
)(DbContentComponent) as React.ComponentClass<Props>
