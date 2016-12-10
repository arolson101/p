import * as React from 'react'
import { Institution } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { connect } from 'react-redux'
import { RouteProps } from './props'

interface Props {}

interface Params {
  institution: Institution.Id
}

interface ConnectedProps {
  current?: CurrentDb
  institutions?: Institution.Cache
}

type AllProps = Props & RouteProps<Params> & ConnectedProps

export const InViewComponent = (props: AllProps) => {
  const { institution } = props.params

  console.assert(props.current)

  const inst = props.institutions && props.institutions.get(Institution.docId({institution}))
  if (institution && !inst) {
    return null as any
  }

  return (
    <div>db '{props.current!.info.title}'
      <div>institution '{inst!.name}'</div>
    </div>
  )
}

export const InView = connect(
  (state: AppState): ConnectedProps => ({
    current: state.db.current,
    institutions: state.db.current && state.db.current.cache.institutions
  })
)(InViewComponent) as React.ComponentClass<Props>
