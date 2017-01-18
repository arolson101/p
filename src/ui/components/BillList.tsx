import * as React from 'react'
import { Table, Column } from 'react-virtualized'
import 'react-virtualized/styles.css'
import { compose, setDisplayName, withHandlers, withProps, pure } from 'recompose'
import { Bill } from '../../docs'
import { getRowData, nameCellRenderer, dateCellRenderer, currencyCellRenderer } from './transactionList'

interface Props {
  bills: Bill.Doc[]
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
  setDisplayName('BillList'),
  withHandlers({
    onScroll: ({setScrollTop}: Props) => (e: Table.OnScrollProps) => {
      setScrollTop(e.scrollTop)
    },
    rowGetter: ({bills}: Props) => ({index}: Table.RowGetterProps) => {
      return bills[index]
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

export const BillList = enhance((props) => {
  const { rowGetter, onRowClick, rowClassName } = props
  const { bills, onScroll, scrollTop, maxWidth, width, height } = props
  return <Table
    tabIndex={null}
    onScroll={onScroll}
    scrollTop={scrollTop}
    style={{flex: 1, maxWidth}}
    headerHeight={20}
    rowCount={bills.length}
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
