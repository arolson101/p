import * as React from 'react'
import { Link } from 'react-router'
import { historyAPI } from '../../state'
import { Body } from './body'
import { RouteProps } from './props'

export const Root = (props: RouteProps) => (
  <div>
    <a href='#' onClick={(event) => {
      event.preventDefault()
      historyAPI.goBack()
    }}>&lt;</a>{' '}
    <a href='#' onClick={(event) => {
      event.preventDefault()
      historyAPI.goForward()
    }}>&gt;</a>{' '}
    [ {props.location.pathname + props.location.search} ]{' '}
    <Link to='/'>/</Link>{' '}
    <div>
      <Body {...props}/>
    </div>
  </div>
)
