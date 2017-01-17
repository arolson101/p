import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { compose, setDisplayName, withProps } from 'recompose'
import { Bill } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Lookup } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'

interface ConnectedProps {
  current: CurrentDb
}

interface EnhancedProps {
  // onCreate
}

type AllProps = React.Props<any> & ConnectedProps & RouteProps<any>

const enhance = compose<AllProps, {}>(
  setDisplayName('Bills'),
  connect(
    (state: AppState, props: RouteProps<any>): ConnectedProps => ({
      current: state.db.current!
    })
  ),
  withProps((props: AllProps) => {

  })
)

export const Bills = enhance((props: AllProps) => {
  const { bills } = props.current.cache

  return (
    <Grid>
      <Breadcrumbs {...props} page='bills'/>
      bills:
      <ul>
        {Lookup.map(bills, bill =>
          <li key={bill._id}>
            {bill.name}
          </li>
        )}
      </ul>
      <div><Link to={Bill.to.create()}>add bill</Link></div>
    </Grid>
  )
})
