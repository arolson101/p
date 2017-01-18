import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { AutoSizer } from 'react-virtualized'
import { compose, setDisplayName, withProps } from 'recompose'
import { Bill } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Container, Item } from './flex'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'
import { withQuerySyncedState } from './queryState'
import { selectBills } from './selectors'
import { BillList } from './BillList'

interface ConnectedProps {
  current: CurrentDb,
  bills: Bill.Doc[]
}

interface EnhancedProps {
  scrollTop: number
  setScrollTop: (scrollTop: number) => void
  selectedIndex: number
  setSelectedIndex: (selectedIndex: number) => void
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<any>

const enhance = compose<AllProps, {}>(
  setDisplayName('Bills'),
  connect(
    (state: AppState, props: RouteProps<any>): ConnectedProps => ({
      current: state.db.current!,
      bills: selectBills(state)
    })
  ),
  withQuerySyncedState('scrollTop', 'setScrollTop', 0, parseFloat),
  withQuerySyncedState('selectedIndex', 'setSelectedIndex', -1, parseFloat),
)

export const Bills = enhance((props: AllProps) => {
  const { bills, scrollTop, setScrollTop, setSelectedIndex, selectedIndex } = props

  return (
    <Grid>
      <Breadcrumbs {...props} page='bills'/>
      <Container>
        <Item flex={1} style={{height: 500}}>
          <AutoSizer>
            {(autoSizerProps: AutoSizer.ChildrenProps) => (
              <BillList
                bills={bills}
                {...autoSizerProps}
                maxWidth={autoSizerProps.width}
                setScrollTop={setScrollTop}
                scrollTop={scrollTop}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
              />
            )}
          </AutoSizer>
        </Item>
      </Container>
      <div><Link to={Bill.to.create()}>add bill</Link></div>
    </Grid>
  )
})
