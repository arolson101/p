import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedDate, FormattedNumber } from 'react-intl'
import * as SplitPane from 'react-split-pane'
import { AutoSizer, Dimensions, Table, Column, ColumnProps, TableCellProps,
  OnScrollCallback, Index, RowMouseEventHandlerParams } from 'react-virtualized'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose, setDisplayName, withHandlers, setPropTypes, onlyUpdateForPropTypes } from 'recompose'
import { AppState } from 'core/state'
import { withQuerySyncedState } from '../enhancers/index'
import './ListWithDetails.css'

type RouteProps = RouteComponentProps<any>

interface Props<T> {
  items: T[]
  toView: (item: T) => string
  columns: ColumnProps[]
  DetailComponent: React.ComponentClass<{item: T}> | React.StatelessComponent<{item: T}>
}

interface ConnectedProps {
}

interface State {
  scrollTop: number
  setScrollTop: (scrollTop: number) => void
  selectedIndex: number
  setSelectedIndex: (selectedIndex: number) => void
}

interface Handlers {
  onScroll: OnScrollCallback
  rowGetter: (info: Index) => any
  rowClassNameWithSelection: ((info: Index) => string)
  onRowClick: (params: RowMouseEventHandlerParams) => void
}

type EnhancedProps = Handlers & State & ConnectedProps & RouteProps & Props<any>

const enhance = compose<EnhancedProps, Props<any>>(
  setDisplayName('ListWithDetails'),
  withRouter,
  onlyUpdateForPropTypes,
  setPropTypes({
    items: PropTypes.array.isRequired,
    toView: PropTypes.func.isRequired,
    columns: PropTypes.array.isRequired,
    DetailComponent: PropTypes.func.isRequired,
  } as PropTypes<Props<any>>),
  connect<ConnectedProps, {}, RouteProps & Props<any>>(
    (state: AppState) => ({})
  ),
  withQuerySyncedState('scrollTop', 'setScrollTop', 0, parseFloat),
  withQuerySyncedState('selectedIndex', 'setSelectedIndex', -1, parseFloat),
  withHandlers<Handlers, State & ConnectedProps & RouteProps & Props<any>>({
    onScroll: ({setScrollTop}) => ({scrollTop}: {scrollTop: number}) => {
      setScrollTop(scrollTop)
    },
    rowGetter: ({items}) => ({index}: Index) => {
      return items[index]
    },
    rowClassNameWithSelection: ({selectedIndex}) => ({index}: Index) => {
      if (index < 0) {
        return 'headerRow'
      } else if (index === selectedIndex) {
        return 'selectedRow'
      } else {
        return index % 2 === 0 ? 'evenRow' : 'oddRow'
      }
    },
    onRowClick: ({/*router, toView, items,*/ setSelectedIndex}) => ({index}: RowMouseEventHandlerParams) => {
      setSelectedIndex(index)
    }
  })
)

export const ListWithDetails = enhance((props) => {
  const { rowGetter, onRowClick, rowClassNameWithSelection, onScroll, columns } = props
  const { scrollTop, selectedIndex, DetailComponent, items } = props
  const selectedItem = selectedIndex !== -1 ? items[selectedIndex] : undefined
  return (
    <SplitPane
      split='vertical'
      minSize={100}
      defaultSize={300}
      primary='second'
    >
      <div style={{height: '100%'}}>
        <AutoSizer>
          {(autoSizerProps: Dimensions) => (
            <Table
              onScroll={onScroll}
              scrollTop={scrollTop}
              style={{flex: 1}}
              headerHeight={20}
              rowCount={items.length}
              rowHeight={50}
              rowGetter={rowGetter}
              rowClassName={rowClassNameWithSelection}
              onRowClick={onRowClick}
              {...autoSizerProps}
            >
              {columns.map(col =>
                <Column key={col.label} {...col}/>
              )}
            </Table>
          )}
        </AutoSizer>
      </div>
      <div>
        {selectedItem &&
          <DetailComponent item={selectedItem}/>
        }
      </div>
   </SplitPane>
  )
})

export const dateCellRenderer = ({cellData}: TableCellProps) => (
  cellData && <FormattedDate value={cellData} />
)

export const currencyCellRenderer = ({cellData}: TableCellProps) => (
  cellData && <FormattedNumber
    value={cellData}
    style='currency'
    currency='USD'
    currencyDisplay='symbol'
  />
)
