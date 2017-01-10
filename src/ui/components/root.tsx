import * as React from 'react'
import { Link } from 'react-router'
import { RouteProps } from './props'
import { Container, Item } from './flex'

export const Root = (props: RouteProps<any>) => (
  <Container column>
    <Item>
      <a href='#' onClick={(event) => {
        event.preventDefault()
        props.router.goBack()
      }}>&lt;</a>{' '}
      <a href='#' onClick={(event) => {
        event.preventDefault()
        props.router.goForward()
      }}>&gt;</a>{' '}
      <input style={{width: 350}} type='text' readOnly value={props.location.pathname + props.location.search}/>
      {' '}
      <Link to='/'>/</Link>{' '}
      <Link to='/logout'>/logout</Link>{' '}
    </Item>
    <Item flex='1' style={{flexDirection: 'column'}}>
      {props.children}
    </Item>
  </Container>
)
