import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { Link } from 'react-router'
import { Bank, Bill } from '../../docs'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'

type AllProps = RouteProps<any>

export const Home = (props: AllProps) => {
  return (
    <Grid>
      <Breadcrumbs {...props}/>
      <div><Link to={Bank.to.all()}>accounts</Link></div>
      <div><Link to={Bill.to.all()}>bills</Link></div>
    </Grid>
  )
}
