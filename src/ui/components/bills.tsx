import * as React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'
import { injectIntl, FormattedDate, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { AutoSizer,Column } from 'react-virtualized'
import { compose, setDisplayName } from 'recompose'
import { Bill } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { BillDetail } from './BillDetail'
import { Breadcrumbs } from './Breadcrumbs'
import { Container, Item } from './flex'
import { ListWithDetails, getRowData, currencyCellRenderer } from './ListWithDetails'
import { selectBills } from './selectors'
import { SettingsMenu } from './SettingsMenu'

const messages = defineMessages({
  page: {
    id: 'bills.page',
    defaultMessage: 'Bills'
  },
  settings: {
    id: 'inRead.settings',
    defaultMessage: 'Options'
  },
  addBill: {
    id: 'bills.addBill',
    defaultMessage: 'Add Bill'
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

type AllProps = EnhancedProps & ConnectedProps

const enhance = compose<AllProps, {}>(
  setDisplayName('Bills'),
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      current: state.db.current!,
      bills: selectBills(state)
    })
  )
)

export const Bills = enhance((props: AllProps) => {
  const { bills } = props

  return (
    <Grid>
      <Breadcrumbs {...props} page={messages.page}/>

      <SettingsMenu
        items={[
          {
            message: messages.addBill,
            to: Bill.to.create()
          }
        ]}
      />

      <PageHeader>
        <FormattedMessage {...messages.page}/>
      </PageHeader>

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
                    dataKey: '',
                    cellDataGetter: getRowData,
                    cellRenderer: dateCellRenderer,
                    width: 100
                  },
                  {
                    label: 'Name',
                    dataKey: '',
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
    </Grid>
  )
})

const nameCellRenderer = ({cellData}: Column.CellRendererArgs<Bill.Doc>) => (
  <div>
    {cellData.name}<br/>
    <small>{cellData.notes}</small>
  </div>
)

const dateCellRenderer = ({cellData}: Column.CellRendererArgs<Bill.Doc>) => (
  cellData && <FormattedDate value={Bill.getDate(cellData)} />
)
