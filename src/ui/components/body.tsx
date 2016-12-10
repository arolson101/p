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

  const inst = props.institutions && props.institutions.get(Institution.docId({institution}))
  if (institution && !inst) {
    return null as any
  }

  return (
    <div>db '{props.dbInfos.get(DbInfo.docId({db: db}))!.title}'
      {institution ? (
        <div>institution '{inst!.name}'</div>
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
    current: state.db.current,
    institutions: state.db.current && state.db.current.cache.institutions
  })
)(BodyComponent) as React.ComponentClass<Props>
