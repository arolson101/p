import * as React from 'react'
import { Link } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { RouteProps } from './props'
import { Container, Item } from './flex'

const enhance = compose<RouteProps<any>, RouteProps<any>>(
  setDisplayName('Root'),
  onlyUpdateForPropTypes,
  setPropTypes({
    location: React.PropTypes.object
  })
)

export const Root = enhance(props =>
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
      <Link to='/'>/ (root)</Link>{' '}
    </Item>
    <Item flex='1' style={{flexDirection: 'column'}}>
      {props.children}
    </Item>
  </Container>
)
