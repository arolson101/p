import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { FormattedDate, FormattedNumber } from 'react-intl'
import * as SplitPane from 'react-split-pane'
import { AutoSizer, Table, Column } from 'react-virtualized'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withHandlers, setPropTypes, onlyUpdateForPropTypes } from 'recompose'
import { AppState } from '../../state/index'
import { RouteProps } from './props'
import { withQuerySyncedState } from '../enhancers/index'
import './ListWithDetails.css'

interface Props<T> {
  items: T[]
  toView: (item: T) => string
  columns: Column.Props[]
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
  onScroll: Table.OnScroll
  rowGetter: Table.RowGetter
  rowClassNameWithSelection: Table.RowClassName
  onRowClick: Table.OnRowClick
}

type EnhancedProps = Handlers & State & ConnectedProps & RouteProps<any> & Props<any>

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
  connect<ConnectedProps, {}, RouteProps<any> & Props<any>>(
    (state: AppState) => ({
      browser: state.browser,
      sideBySide: state.browser.greaterThan.small
    })
  ),
  withQuerySyncedState('scrollTop', 'setScrollTop', 0, parseFloat),
  withQuerySyncedState('selectedIndex', 'setSelectedIndex', -1, parseFloat),
  withHandlers<Handlers, State & ConnectedProps & RouteProps<any> & Props<any>>({
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
    onRowClick: ({/*router, toView, items,*/ setSelectedIndex}) => ({index}: Table.OnRowClickProps) => {
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
          {(autoSizerProps: AutoSizer.ChildrenProps) => (
            <Table
              tabIndex={null}
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

export const getRowData = ({rowData}: Column.CellDataGetterArgs<any>) => {
  return rowData
}

export const getRowDoc = ({rowData}: Column.CellDataGetterArgs<any>) => {
  return rowData.doc
}

export const dateCellRenderer = ({cellData}: Column.CellRendererArgs<Date>) => (
  cellData && <FormattedDate value={cellData} />
)

export const currencyCellRenderer = ({cellData}: Column.CellRendererArgs<number>) => (
  cellData && <FormattedNumber
    value={cellData}
    style='currency'
    currency='USD'
    currencyDisplay='symbol'
  />
)
