import * as React from 'react'
import { FormattedDate, FormattedNumber } from 'react-intl'
import { Table, Column } from 'react-virtualized'
import 'react-virtualized/styles.css'
import { compose, renderComponent, ComponentEnhancer, setDisplayName, withHandlers, withProps, pure } from 'recompose'
import { Transaction } from '../../docs'
import { resolveProp } from './resolveProp'

interface BaseProps {
  scrollTop: number
  setScrollTop: (scrollTop: number) => void
  selectedIndex: number
  setSelectedIndex: (selectedIndex: number) => void
  maxWidth: number
  width: number
  height: number
}

interface Props extends BaseProps {
  transactions: Transaction.Doc[]
}

interface EnhancedProps extends Props {
  onScroll: Table.OnScroll
  rowGetter: Table.RowGetter
  rowClassName: Table.RowClassName
  getTransaction: Column.CellDataGetter<Transaction.Doc>
  onRowClick: Table.OnRowClick
  nameCellRenderer: Column.CellRenderer<Transaction>
  dateCellRenderer: Column.CellRenderer<Date>
  currencyCellRenderer: Column.CellRenderer<number>
}

const enhance = compose(
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
  withProps({
    getTransaction: ({rowData}: Column.CellDataGetterArgs<Transaction.Doc>) => {
      return rowData
    },
    nameCellRenderer: ({cellData}: Column.CellRendererArgs<Transaction>) => (
      <div>
        {cellData.name}<br/>
        <small>{cellData.memo}</small>
      </div>
    ),
    dateCellRenderer: ({cellData}: Column.CellRendererArgs<Date>) => (
      <FormattedDate value={cellData} />
    ),
    currencyCellRenderer: ({cellData}: Column.CellRendererArgs<number>) => (
      <FormattedNumber value={cellData} style='currency' currency='USD' currencyDisplay='symbol' />
    )
  }),
  pure
) as ComponentEnhancer<EnhancedProps, Props>

export const TransactionList = enhance((props: EnhancedProps) => {
  const { rowGetter, onRowClick, getTransaction, rowClassName, nameCellRenderer, dateCellRenderer, currencyCellRenderer } = props
  const { transactions, onScroll, scrollTop, maxWidth, width, height } = props
  return <Table
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
      cellDataGetter={getTransaction}
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
}) as React.ComponentClass<Props>

interface PProps extends BaseProps {
  transactions: Promise<Transaction.Doc[]>
}

const SpinnerRender = () => <div>loading</div>
const ErrorRender = ({ transactions: error }: { transactions: Error }) => <div>error: {error.message}</div>

export const ResolvedTransactionList = resolveProp(
  'transactions',
  renderComponent(SpinnerRender),
  renderComponent(ErrorRender)
)(TransactionList) as React.ComponentClass<PProps>
