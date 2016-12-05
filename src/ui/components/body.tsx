import * as React from 'react'
import { Institution, DbInfo } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { connect } from 'react-redux'
import { DbLogin } from './dbLogin'
import { DbCreate } from './dbCreate'
import { DbView } from './dbView'
import { InCreate } from './inCreate'
import { DbIndex } from './dbIndex'
import { RouteProps } from './props'

interface Props {}

interface ConnectedProps {
  dbInfos: DbInfo.Cache
  current?: CurrentDb
  institutions?: Institution.Cache
}

type AllProps = Props & RouteProps & ConnectedProps

export const BodyComponent = (props: AllProps) => {
  const { db, institution } = props.params
  const create = 'create' in props.location.query

  if (!db) {
    if (create) {
      return <DbCreate {...props}/>
    } else {
      return <DbIndex {...props}/>
    }
  }

  if (!props.current || DbInfo.idFromDocId(props.current.info._id) !== db) {
    return <DbLogin {...props}/>
  }

  const institutions = props.current.cache.institutions

  return (
    <div>db '{props.dbInfos.get(DbInfo.docId({db: db}))!.title}'
      {institution ? (
        <div>institution '{institutions.get(Institution.docId({institution}))!.name}'</div>
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
    dbInfos: state.db.meta.infos,
    current: state.db.current
  })
)(BodyComponent) as React.ComponentClass<RouteProps>
