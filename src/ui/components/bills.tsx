import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { AutoSizer,Column } from 'react-virtualized'
import { compose, setDisplayName } from 'recompose'
import { Bill } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Container, Item } from './flex'
import { Breadcrumbs } from './breadcrumbs'
import { RouteProps } from './props'
import { selectBills } from './selectors'
import { ListWithDetails, getRowData, dateCellRenderer, currencyCellRenderer } from './ListWithDetails'

const messages = defineMessages({
  page: {
    id: 'bills.page',
    defaultMessage: 'Bills'
  }
})

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
  )
)

const BillDetail = ({item}: {item: Bill.Doc}) => {
  return <div>bill detail: {item.name}</div>
}

export const Bills = enhance((props: AllProps) => {
  const { bills } = props

  return (
    <Grid>
      <Breadcrumbs {...props} page={messages.page}/>
      <Container>
        <Item flex={1} style={{height: 500}}>
          <AutoSizer>
            {(autoSizerProps: AutoSizer.ChildrenProps) => (
              <ListWithDetails
                items={bills}
                {...autoSizerProps}
                columns={[
                  {
                    label: 'Date',
                    dataKey: 'time',
                    cellRenderer: dateCellRenderer,
                    width: 100
                  },
                  {
                    label: 'Name',
                    dataKey: 'name',
                    width: 300,
                    flexGrow: 1,
                    cellDataGetter: getRowData,
                    cellRenderer: nameCellRenderer
                  },
                  {
                    label: 'Amount',
                    dataKey: 'amount',
                    headerClassName: 'alignRight',
                    style: {textAlign: 'right'},
                    cellRenderer: currencyCellRenderer,
                    width: 100
                  }
                ]}
                DetailComponent={BillDetail}
                toView={Bill.to.view}
              />
            )}
          </AutoSizer>
        </Item>
      </Container>
      <div><Link to={Bill.to.create()}>add bill</Link></div>
    </Grid>
  )
})

const nameCellRenderer = ({cellData}: Column.CellRendererArgs<Bill.Doc>) => (
  <div>
    {cellData.name}<br/>
    <small>{cellData.notes}</small>
  </div>
)
