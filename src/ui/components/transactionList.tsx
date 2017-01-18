import * as React from 'react'
import { FormattedDate, FormattedNumber } from 'react-intl'
import { Table, Column } from 'react-virtualized'
import 'react-virtualized/styles.css'
import { compose, setDisplayName, withHandlers, withProps, pure } from 'recompose'
import { Transaction } from '../../docs'
import './transactionList.css'

interface Props {
  transactions: Transaction.Doc[]
  scrollTop: number
  setScrollTop: (scrollTop: number) => void
  selectedIndex: number
  setSelectedIndex: (selectedIndex: number) => void
  maxWidth: number
  width: number
  height: number
}

interface EnhancedProps extends Props {
  onScroll: Table.OnScroll
  rowGetter: Table.RowGetter
  rowClassName: Table.RowClassName
  onRowClick: Table.OnRowClick
}

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('TransactionList'),
  withHandlers({
    onScroll: ({setScrollTop}: Props) => (e: Table.OnScrollProps) => {
      setScrollTop(e.scrollTop)
    },
    rowGetter: ({transactions}: Props) => ({index}: Table.RowGetterProps) => {
      return transactions[index]
    },
    rowClassName: ({selectedIndex}: Props) => ({index}: Table.RowClassNameProps) => {
      if (index < 0) {
        return 'headerRow'
      } else if (index === selectedIndex) {
        return 'selectedRow'
      } else {
        return index % 2 === 0 ? 'evenRow' : 'oddRow'
      }
    },
    onRowClick: ({setSelectedIndex}: Props) => ({index}: Table.OnRowClickProps) => {
      setSelectedIndex(index)
    }
  }),
  pure
)

export const TransactionList = enhance((props) => {
  const { rowGetter, onRowClick, rowClassName } = props
  const { transactions, onScroll, scrollTop, maxWidth, width, height } = props
  return <Table
    tabIndex={null}
    onScroll={onScroll}
    scrollTop={scrollTop}
    style={{flex: 1, maxWidth}}
    headerHeight={20}
    rowCount={transactions.length}
    rowHeight={50}
    rowGetter={rowGetter}
    rowClassName={rowClassName}
    onRowClick={onRowClick}
    height={height}
    width={width}
  >
    <Column
      label='Date'
      dataKey='time'
      cellRenderer={dateCellRenderer}
      width={100}
    />
    <Column
      label='Name'
      dataKey='name'
      width={300}
      flexGrow={1}
      cellDataGetter={getRowData}
      cellRenderer={nameCellRenderer}
    />
    <Column
      label='Amount'
      dataKey='amount'
      headerClassName='alignRight'
      style={{textAlign: 'right'}}
      cellRenderer={currencyCellRenderer}
      width={100}
    />
  </Table>
})

export const getRowData = ({rowData}: Column.CellDataGetterArgs<Transaction.Doc>) => {
  return rowData
}

export const nameCellRenderer = ({cellData}: Column.CellRendererArgs<Transaction>) => (
  <div>
    {cellData.name}<br/>
    <small>{cellData.memo}</small>
  </div>
)

export const dateCellRenderer = ({cellData}: Column.CellRendererArgs<Date>) => (
  cellData && <FormattedDate value={cellData} />
)

export const currencyCellRenderer = ({cellData}: Column.CellRendererArgs<number>) => (
  cellData && <FormattedNumber value={cellData} style='currency' currency='USD' currencyDisplay='symbol' />
)
