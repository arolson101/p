import * as React from 'react'
import { Router, Link } from 'react-router'
import { historyAPI } from '../../modules'

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
    <Link to='/asdf/foo'>/asdf</Link>{' '}
    <Link to='/login'>/login</Link>{' '}
    {props.children}
  </div>
)
