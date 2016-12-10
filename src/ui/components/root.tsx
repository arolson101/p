import * as React from 'react'
import { Link } from 'react-router'
import { historyAPI } from '../../state'
import { RouteProps } from './props'

export const Root = (props: RouteProps<any>) => (
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
    <Link to='/logout'>/logout</Link>{' '}
    <div>
      {props.children}
    </div>
  </div>
)
