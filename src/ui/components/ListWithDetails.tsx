import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedDate, FormattedNumber } from 'react-intl'
import { Table, Column } from 'react-virtualized'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withHandlers, setPropTypes, onlyUpdateForPropTypes } from 'recompose'
import { AppState, ResponsiveState } from '../../state'
import { Container, Item } from './flex'
import { RouteProps } from './props'
import { withQuerySyncedState } from '../enhancers'
import './ListWithDetails.css'

interface Props<T> {
  items: T[]
  toView: (item: T) => string
  columns: Column.Props[]
  DetailComponent: React.ComponentClass<{item: T}> | React.StatelessComponent<{item: T}>
  width: number
  height: number
}

interface ConnectedProps {
  browser: ResponsiveState
  sideBySide: boolean
}

type EnhancedProps = Props<any> & ConnectedProps & RouteProps<any> & {
  width: number
  height: number
  scrollTop: number
  setScrollTop: (scrollTop: number) => void
  selectedIndex: number
  setSelectedIndex: (selectedIndex: number) => void
  onScroll: Table.OnScroll
  rowGetter: Table.RowGetter
  rowClassName: Table.RowClassName
  rowClassNameWithSelection: Table.RowClassName
  onRowClick: Table.OnRowClick
}

const enhance = compose<EnhancedProps, Props<any>>(
  setDisplayName('ListWithDetails'),
  onlyUpdateForPropTypes,
  setPropTypes({
    items: React.PropTypes.array.isRequired,
    toView: React.PropTypes.func.isRequired,
    columns: React.PropTypes.array.isRequired,
    DetailComponent: React.PropTypes.func.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  } as PropTypes<Props<any>>),
  withRouter,
  connect(
    (state: AppState): ConnectedProps => ({
      browser: state.browser,
      sideBySide: state.browser.greaterThan.small
    })
  ),
  withQuerySyncedState('scrollTop', 'setScrollTop', 0, parseFloat),
  withQuerySyncedState('selectedIndex', 'setSelectedIndex', -1, parseFloat),
  withHandlers<EnhancedProps,EnhancedProps>({
    onScroll: ({setScrollTop}) => (e: Table.OnScrollProps) => {
      setScrollTop(e.scrollTop)
    },
    rowGetter: ({items}) => ({index}: Table.RowGetterProps) => {
      return items[index]
    },
    rowClassNameWithSelection: ({selectedIndex}) => ({index}: Table.RowClassNameProps) => {
      if (index < 0) {
        return 'headerRow'
      } else if (index === selectedIndex) {
        return 'selectedRow'
      } else {
        return index % 2 === 0 ? 'evenRow' : 'oddRow'
      }
    },
    rowClassName: () => ({index}: Table.RowClassNameProps) => {
      if (index < 0) {
        return 'headerRow'
      } else {
        return index % 2 === 0 ? 'evenRow' : 'oddRow'
      }
    },
    onRowClick: ({sideBySide, router, toView, items, setSelectedIndex}) => ({index}: Table.OnRowClickProps) => {
      if (!sideBySide && index !== -1) {
        router.push(toView(items[index]))
      } else {
        setSelectedIndex(index)
      }
    }
  })
)

export const ListWithDetails = enhance((props) => {
  const { rowGetter, onRowClick, rowClassName, rowClassNameWithSelection, onScroll, columns, width, height } = props
  const { sideBySide, browser, scrollTop, selectedIndex, DetailComponent, items } = props
  const listMaxWidth = sideBySide ? (browser.breakpoints.small / 2) : Infinity
  const selectedItem = selectedIndex !== -1 ? items[selectedIndex] : undefined
  return (
    <Container style={{width}}>
      <Item flex={1} style={{maxWidth: listMaxWidth}}>
        <Table
          tabIndex={null}
          onScroll={onScroll}
          scrollTop={scrollTop}
          style={{flex: 1, maxWidth: listMaxWidth}}
          headerHeight={20}
          rowCount={items.length}
          rowHeight={50}
          rowGetter={rowGetter}
          rowClassName={sideBySide ? rowClassNameWithSelection : rowClassName}
          onRowClick={onRowClick}
          height={height}
          width={Math.min(width, listMaxWidth)}
        >
          {columns.map(col =>
            <Column key={col.label} {...col}/>
          )}
        </Table>
      </Item>
      {sideBySide &&
        <Item flex={1}>
          {selectedItem &&
            <DetailComponent {...props} item={selectedItem}/>
          }
        </Item>
      }
    </Container>
  )
})

export const getRowData = ({rowData}: Column.CellDataGetterArgs<any>) => {
  return rowData
}

export const dateCellRenderer = ({cellData}: Column.CellRendererArgs<Date>) => (
  cellData && <FormattedDate value={cellData} />
)

export const currencyCellRenderer = ({cellData}: Column.CellRendererArgs<number>) => (
  cellData && <FormattedNumber value={cellData} style='currency' currency='USD' currencyDisplay='symbol' />
)
