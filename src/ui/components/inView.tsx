import * as React from 'react'
import Loading from 'react-loading-bar'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Institution } from '../../docs'
import { AppState } from '../../state'
import { RouteProps } from './props'

interface Props {}

interface ConnectedProps {
  institution?: Institution.Doc
}

type AllProps = Props & RouteProps<Institution.Params> & ConnectedProps

export const InViewComponent = (props: AllProps) => {
  const { institution } = props
  return (
    <div>
      <Loading color='red' show={!institution}/>
      {institution &&
        <div>
          <h1>{institution.name}</h1>
          <Link to={Institution.accountCreatePath(institution)}>add account</Link>
        </div>
      }
    </div>
  )
}

const selectInstitution = (state: AppState, props: RouteProps<Institution.Params>) => {
  const id = Institution.docId(props.params)
  return state.db.current && state.db.current.cache.institutions.get(id)
}

export const InView = connect(
  (state: AppState, props: RouteProps<Institution.Params>): ConnectedProps => ({
    institution: selectInstitution(state, props)
  })
)(InViewComponent) as React.ComponentClass<Props>
