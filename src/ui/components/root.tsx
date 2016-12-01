import * as React from 'react'
import { Router, Link } from 'react-router'
import { historyAPI } from '../../state'
import { Body } from './body'

export const Root = (props: Router.RouteComponentProps<any, any>) => (
  <div>
    <a href='#' onClick={(event) => {
      event.preventDefault()
      historyAPI.goBack()
    }}>&lt;</a>{' '}
    <a href='#' onClick={(event) => {
      event.preventDefault()
      historyAPI.goForward()
    }}>&gt;</a>{' '}
    [ {props.location!.pathname + ' ' + props.location!.search} ]{' '}
    <Link to='/'>/</Link>{' '}
    <div>
      <Body {...props}/>
    </div>
  </div>
)
