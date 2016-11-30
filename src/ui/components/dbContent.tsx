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

type AllProps = React.Props<any> & Props & ConnectedProps & RouteProps

export const DbContentComponent = (props: AllProps) => {
  if (!props.current) {
    return <DbLogin {...props}/>
  }

  return (
    <div>db is {props.params.db}
      {props.children}
    </div>
  )
}

export const DbContent = connect(
  (state: AppState): ConnectedProps => ({
    current: state.db.current
  })
)(DbContentComponent) as React.ComponentClass<Props>
