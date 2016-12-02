import * as React from 'react'
import { Institution, Account, DbInfo } from '../../docs'
import { AppState } from '../../state'
import { connect } from 'react-redux'
import { DbLogin } from './dbLogin'
import { DbCreate } from './dbCreate'
import { DbView } from './dbView'
import { InCreate } from './inCreate'
import { DbIndex } from './dbIndex'
import { RootProps } from './root'

interface Props {}

type AllProps = Props & RootProps

export const Body = (props: AllProps) => {
  const { db, institution } = props.params!
  const create = 'create' in props.location!.query

  if (!db) {
    if (create) {
      return <DbCreate {...props}/>
    } else {
      return <DbIndex {...props}/>
    }
  }

  if (!props.current || props.current._id !== db) {
    return <DbLogin {...props}/>
  }

  if (!props.dbq) {
    return null as any
  }

  return (
    <div>db '{props.dbInfos[DbInfo.docId({dbInfo: db})].title}'
      {institution ? (
        <div>institution '{props.dbq.institutions[Institution.docId({institution})].name}'</div>
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
