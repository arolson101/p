import * as React from 'react'
import { Institution, Account } from '../../docs'
import { AppState, OpenDb } from '../../state'
import { connect } from 'react-redux'
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

type InstitutionWithAccounts = Institution.Doc & {
  accounts: Account.Doc[]
}

export const DbRootComponent = (props: AllProps) => {
  if (!props.current || props.current._id !== props.params.db) {
    return <DbLogin {...props}/>
  }

  return (
    <div>db is {props.params.db}
      {props.children}
    </div>
  )
}

export const DbRoot = connect(
  (state: AppState, props: RouteProps): ConnectedProps => ({
    current: state.db.current
  })
)(DbRootComponent as any) as React.ComponentClass<Props>
