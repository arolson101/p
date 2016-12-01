import * as React from 'react'
import { Institution, Account } from '../../docs'
import { AppState, OpenDb } from '../../state'
import { connect } from 'react-redux'
import { DbLogin } from './dbLogin'
import { DbCreate } from './dbCreate'
import { DbView } from './dbView'
import { InCreate } from './inCreate'
import { DbIndex } from './dbIndex'

interface Props {
}

interface ConnectedProps {
  current?: OpenDb<any>
}

interface DispatchedProps {
  dispatch: Redux.Dispatch<AppState>
}

interface RouteProps {
  params: {
    db: string
    institution: string
    account: string
  }
  location: {
    query: {
      create?: boolean
    }
  }
}

type AllProps = React.Props<any> & Props & ConnectedProps & DispatchedProps & RouteProps

type InstitutionWithAccounts = Institution.Doc & {
  accounts: Account.Doc[]
}

export const BodyComponent = (props: AllProps) => {
  const { db, institution } = props.params
  const create = typeof props.location.query.create !== 'undefined'

  if (!db) {
    if (create) {
      return <DbCreate {...props}/>
    } else {
      return <DbIndex {...props}/>
    }
  }

  if (!props.current) {
    return <DbLogin {...props}/>
  }

  return (
    <div>db is {db}
      {institution ? (
        <div>institution {institution}</div>
      ) : (
        create ? (
          <InCreate {...props}/>
        ) : (
          <DbView {...props}/>
        )
      )}
    </div>
  )
}

export const Body = connect(
  (state: AppState): ConnectedProps => ({
    current: state.db.current
  })
)(BodyComponent) as React.ComponentClass<Props>
