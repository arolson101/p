import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { injectIntl, FormattedDate, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Column } from 'react-virtualized'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs'
import { AppState } from '../../state'
import { BillDetail } from './BillDetail'
import { Favico } from './forms/Favico'
import { ListWithDetails, getRowData, currencyCellRenderer } from './ListWithDetails'
import { selectBills } from './selectors'
import { SettingsMenu } from './SettingsMenu'

const messages = defineMessages({
  page: {
    id: 'Bills.page',
    defaultMessage: 'Bills'
  },
  settings: {
    id: 'Bills.settings',
    defaultMessage: 'Options'
  },
  addBill: {
    id: 'Bills.addBill',
    defaultMessage: 'Add Bill'
  }
})

interface ConnectedProps {
  bills: Bill.View[]
}

type AllProps = ConnectedProps

const enhance = compose<AllProps, {}>(
  setDisplayName('Bills'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      bills: selectBills(state)
    })
  )
)

export const Bills = enhance((props: AllProps) => {
  const { bills } = props

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>

      <PageHeader>
        <SettingsMenu
          items={[
            {
              message: messages.addBill,
              to: Bill.to.create()
            }
          ]}
        />

        <FormattedMessage {...messages.page}/>
      </PageHeader>

      <ListWithDetails
        items={bills}
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
    </div>
  )
})

const nameCellRenderer = ({cellData}: Column.CellRendererArgs<Bill.View>) => (
  <div>
    <Favico value={cellData.doc.favicon}/>
    {' '}
    {cellData.doc.name}<br/>
    <small>{cellData.doc.notes}</small>
  </div>
)

const dateCellRenderer = ({cellData}: Column.CellRendererArgs<Bill.View>) => (
  cellData && <FormattedDate value={Bill.getDate(cellData)} />
)
