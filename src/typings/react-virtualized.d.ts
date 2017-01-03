// https://github.com/bvaughn/react-virtualized
// version 8.8.1

declare module "react-virtualized" {
  /**
   * Renders scattered or non-linear data. Unlike Grid, which renders checkerboard data, Collection can render
   * arbitrarily positioned- even overlapping- data.
   * 
   * Note that this component's measuring and layout phase is more expensive than Grid since it can not assume
   * a correlation between a cell's index and position. For this reason it will take signifnicantly longer to
   * initialize than the more linear/checkerboard components.
   */
  export class Collection extends React.Component<Collection.Props, any> {

    /**
     * Recomputes cell sizes and positions.
     * 
     * This function should be called if cell sizes or positions have changed but nothing else has. Since
     * Collection only receives cellCount (and not the underlying List or Array) it has no way of detecting
     *  when the underlying data changes.
     */
    recomputeCellSizesAndPositions(): void
  }

  export namespace Collection {
    export type CellGroupRenderer = (props: { cellSizeAndPositionGetter: CellSizeAndPositionGetter, indices: number[], cellRenderer: CellRenderer }) => React.ReactNode[]
    export type CellRenderer = (props: { index: number, isScrolling: boolean, key: string, style: Object }) => React.ReactElement<any>
    export type CellSizeAndPositionGetter = (props: { index: number }) => { height: number, width: number, x: number, y: number }
    export type NoContentRenderer = () => React.ReactNode
    export type OnSectionRendered = (props: { indices: Array<number> }) => void
    export type OnScroll = (props: { clientHeight: number, clientWidth: number, scrollHeight: number, scrollLeft: number, scrollTop: number, scrollWidth: number }) => void

    export interface Props {
      /**
       * Outer height of Collection is set to "auto". This property should only be used in conjunction with the
       * WindowScroller HOC.
       */
      autoHeight?: boolean
      /**
       * to attach to root Collection element.
       */
      className?: string
      /**
       * Number of cells in collection.
       */
      cellCount: number
      /**
       * Responsible for rendering a group of cells given their indices.:
       * ({ cellSizeAndPositionGetter:Function, indices: Array<number>, cellRenderer: Function }): Array<PropTypes.node>
       */
      cellGroupRenderer?: CellGroupRenderer
      /**
       * Responsible for rendering a cell given an row and column index:
       * ({ index: number, isScrolling: boolean, key: string, style: object }): PropTypes.element
       */
      cellRenderer: CellRenderer
      /**
       * Callback responsible for returning size and offset/position information for a given cell (index):
       * ({ index: number }): { height: number, width: number, x: number, y: number }
       */
      cellSizeAndPositionGetter: CellSizeAndPositionGetter
      /**
       * Height of Collection; this property determines the number of visible (vs virtualized) rows.
       */
      height: number
      /**
       * Enables the Collection to horiontally "overscan" its content similar to how Grid does. This can reduce flicker
       * around the edges when a user scrolls quickly. This property defaults to 0;
       */
      horizontalOverscanSize?: number
      /**
       * Optional custom id to attach to root Collection element.
       */
      id?: string
      /**
       * Optional renderer to be rendered inside the grid when cellCount is 0: (): PropTypes.node
       */
      noContentRenderer?: NoContentRenderer
      /**
       * Callback invoked with information about the section of the Collection that was just rendered:
       * ({ indices: Array<number> }): void
       */
      onSectionRendered?: OnSectionRendered
      /**
       * Callback invoked whenever the scroll offset changes within the inner scrollable region:
       * ({ clientHeight: number, clientWidth: number, scrollHeight: number, scrollLeft: number,
       *  scrollTop: number, scrollWidth: number }): void
       */
      onScroll?: OnScroll
      /**
       * Horizontal offset
       */
      scrollLeft?: number
      /**
       * Controls the alignment of scrolled-to-cells. The default ("auto") scrolls the least amount possible to ensure
       * that the specified cell is fully visible. Use "start" to always align cells to the top/left of the Collection
       * and "end" to align them bottom/right. Use "center" to align specified cell in the middle of container.
       */
      scrollToAlignment?: 'auto' | 'start' | 'end' | 'center'
      /**
       * Cell index to ensure visible (by scrolling if necessary)
       */
      scrollToCell?: number
      /**
       * Vertical offset
       */
      scrollTop?: number
      /**
       * Optionally override the size of the sections a Collection's cells are split into. This is an advanced option
       * and should only be used for performance tuning purposes.
       */
      sectionSize?: number
      /**
       * Optional custom inline style to attach to root Collection element.
       */
      style?: Object
      /**
       * Enables the Collection to vertically "overscan" its content similar to how Grid does. This can reduce flicker
       * around the edges when a user scrolls quickly. This property defaults to 0;
       */
      verticalOverscanSize?: number
      /**
       * Width of Collection; this property determines the number of visible (vs virtualized) columns.
       */
      width: number
    }
  }

  /**
   * A windowed grid of elements. Grid only renders cells necessary to fill itself based on the current
   * horizontal and vertical scroll position.
   */
  export class Grid extends React.Component<Grid.Props, any> {
    /**
     * Pre-measure all columns and rows in a Grid.
     * 
     * Typically cells are only measured as needed and estimated sizes are used for cells that have not yet
     * been measured. This method ensures that the next call to getTotalSize() returns an exact size (as opposed
     * to just an estimated one).
     */
    measureAllCells(): void
    /**
     * Recomputes row heights and column widths after the specified index (both default to 0).
     * 
     * This function should be called if dynamic column or row sizes have changed but nothing else has. Since Grid
     * only receives columnCount and rowCount it has no way of detecting when the underlying data changes.
     * 
     * This method will also force a render cycle (via forceUpdate) to ensure that the updated measurements are
     * reflected in the rendered grid.
     */
    recomputeGridSize(props: { columnIndex: number, rowIndex: number }): void
  }

  export namespace Grid {
    export type ColumnWidth = (props: { index: number }) => number
    export type CellRenderer = (props: {
      /**
       * Horizontal (column) index of cell
       */
      columnIndex: number
      /**
       * The Grid is currently being scrolled
       */
      isScrolling: boolean
      /**
       * This cell is visible within the grid (eg it is not an overscanned cell)
       */
      isVisible: boolean
      /**
       * Unique key within array of cells
       */
      key: any
      /**
       * Vertical (row) index of cell
       */
      rowIndex: number
      /**
       * Style object to be applied to cell (to position it)
       */
      style: Object
    }) => React.ReactElement<any>[]
    export type CellRangeRenderer = (props: {
      /**
       * Temporary cell cache used while scrolling
       */
      cellCache: any
      /**
       * Cell renderer prop supplied to Grid
       */
      cellRenderer: CellRenderer
      /**
       * @see CellSizeAndPositionManager
       */
      columnSizeAndPositionManager: any
      /**
       * Index of first column (inclusive) to render
       */
      columnStartIndex: number
      /**
       * Index of last column (inclusive) to render
       */
      columnStopIndex: number
      /**
       * Horizontal pixel offset (required for scaling)
       */
      horizontalOffsetAdjustment: number
      /**
       * The Grid is currently being scrolled
       */
      isScrolling: boolean
      /**
       * @see CellSizeAndPositionManager,
       */
      rowSizeAndPositionManager: any
      /**
       * Index of first column (inclusive) to render
       */
      rowStartIndex: number
      /**
       * Index of last column (inclusive) to render
       */
      rowStopIndex: number
      /**
       * Current horizontal scroll offset of Grid
       */
      scrollLeft: number
      /**
       * Current vertical scroll offset of Grid
       */
      scrollTop: number
      /**
       * Temporary style (size & position) cache used while scrolling
       */
      styleCache: any
      /**
       * Vertical pixel offset (required for scaling)
       */
      verticalOffsetAdjustment: number
    }) => React.ReactElement<any>[]
    export type NoContentRenderer = () => React.ReactNode
    export type OnSectionRendered = (props: {
      columnOverscanStartIndex: number,
      columnOverscanStopIndex: number,
      columnStartIndex: number,
      columnStopIndex: number,
      rowOverscanStartIndex: number,
      rowOverscanStopIndex: number,
      rowStartIndex: number,
      rowStopIndex: number
    }) => void
    export type OnScroll = (props: {
      clientHeight: number,
      clientWidth: number,
      scrollHeight: number,
      scrollLeft: number,
      scrollTop: number,
      scrollWidth: number
    }) => void
    export type RowHeight = (props: { index: number }) => number

    export interface Props {
      /**
       * Set the width of the inner scrollable container to 'auto'. This is useful for single-column Grids to ensure
       * that the column doesn't extend below a vertical scrollbar.
       */
      autoContainerWidth?: boolean
      /**
       * Outer height of Grid is set to "auto". This property should only be used in conjunction with the
       * WindowScroller HOC.
       */
      autoHeight?: boolean
      /**
       * Responsible for rendering a group of cells given their index ranges. Learn more
       */
      cellRangeRenderer?: CellRangeRenderer
      /**
       * Responsible for rendering a cell given an row and column index. Learn more
       */
      cellRenderer: CellRenderer
      /**
       * Optional custom CSS class name to attach to root Grid element.
       */
      className?: string
      /**
       * Number of columns in grid.
       */
      columnCount: number
      /**
       * Either a fixed column width (number) or a function that returns the width of a column given its index: 
       * ({ index: number }): number
       */
      columnWidth: number | ColumnWidth
      /**
       * Optional custom inline style to attach to inner cell-container element.
       */
      containerStyle?: Object
      /**
       * Used to estimate the total width of a Grid before all of its columns have actually been measured. The 
       * estimated total width is adjusted as columns are rendered.
       */
      estimatedColumnSize?: number
      /**
       * Used to estimate the total height of a Grid before all of its rows have actually been measured. The estimated
       * total height is adjusted as rows are rendered.
       */
      estimatedRowSize?: number
      /**
       * Height of Grid; this property determines the number of visible (vs virtualized) rows.
       */
      height: number
      /**
       * Optional custom id to attach to root Grid element.
       */
      id?: string
      /**
       * Optional renderer to be rendered inside the grid when either rowCount or columnCount is empty: (): PropTypes.node
       */
      noContentRenderer?: NoContentRenderer
      /**
       * Callback invoked with information about the section of the Grid that was just rendered. This callback is only 
       * invoked when visible rows have changed: ({ columnOverscanStartIndex: number, columnOverscanStopIndex: number,
       *  columnStartIndex: number, columnStopIndex: number, rowOverscanStartIndex: number, rowOverscanStopIndex: number,
       *  rowStartIndex: number, rowStopIndex: number }): void
       */
      onSectionRendered?: OnSectionRendered
      /**
       * Callback invoked whenever the scroll offset changes within the inner scrollable region:
       * ({ clientHeight: number, clientWidth: number, scrollHeight: number, scrollLeft: number, scrollTop: number,
       *  scrollWidth: number }): void
       */
      onScroll?: OnScroll
      /**
       * Number of columns to render before/after the visible slice of the grid. This can help reduce flickering during
       * scrolling on certain browers/devices.
       */
      overscanColumnCount?: number
      /**
       * Number of rows to render above/below the visible slice of the grid. This can help reduce flickering during
       * scrolling on certain browers/devices.
       */
      overscanRowCount?: number
      /**
       * Number of rows in grid.
       */
      rowCount: number
      /**
       * Either a fixed row height (number) or a function that returns the height of a row given its index:
       * ({ index: number }): number
       */
      rowHeight: number | RowHeight
      /**
       * Wait this amount of time after the last scroll event before resetting Grid pointer-events; defaults to 150ms.
       */
      scrollingResetTimeInterval?: number
      /**
       * Horizontal offset
       */
      scrollLeft?: number
      /**
       * Controls the alignment of scrolled-to-cells. The default ("auto") scrolls the least amount possible to 
       * ensure that the specified cell is fully visible. Use "start" to always align cells to the top/left of 
       * the Grid and "end" to align them bottom/right. Use "center" to align specified cell in the middle of container.
       */
      scrollToAlignment?: 'auto' | 'start' | 'end' | 'center'
      /**
       * Column index to ensure visible (by forcefully scrolling if necessary)
       */
      scrollToColumn?: number
      /**
       * Row index to ensure visible (by forcefully scrolling if necessary)
       */
      scrollToRow?: number
      /**
       * Vertical offset
       */
      scrollTop?: number
      /**
       * Optional custom inline style to attach to root Grid element.
       */
      style?: Object
      /**
       * Optional override of tab index default; defaults to 0.
       */
      tabIndex?: number
      /**
       * Width of Grid; this property determines the number of visible (vs virtualized) columns.
       */
      width: number
    }
  }

  /**
   * This component renders a windowed list of elements. Elements can have fixed or varying heights.
   */
  export class List extends React.Component<List.Props, any> {
    /**
     * Forcefull re-render the inner Grid component.
     * 
     * Calling forceUpdate on List may not re-render the inner Grid since it uses shallowCompare as a performance
     * optimization. Use this method if you want to manually trigger a re-render. This may be appropriate if the
     * underlying row data has changed but the row sizes themselves have not.
     */
    forceUpdateGrid(): void
    /**
     * Pre-measure all rows in a List.
     * 
     * Typically rows are only measured as needed and estimated heights are used for cells that have not yet been
     * measured. This method ensures that the next call to getTotalSize() returns an exact size (as opposed to just
     * an estimated one).
     */
    measureAllRows(): void
    /**
     * Recompute row heights and offsets after the specified index (defaults to 0).
     * 
     * List has no way of knowing when its underlying list data has changed since it only receives a rowHeight property.
     * If the rowHeight is a number it can compare before and after values but if it is a function that comparison is
     * error prone. In the event that a dynamic rowHeight function is in use and the row heights have changed this
     * function should be manually called by the "smart" container parent.
     * 
     * This method will also force a render cycle (via forceUpdate) to ensure that the updated measurements are
     * reflected in the rendered list.
     */
    recomputeRowHeights(index: number): void
  }

  export namespace List {
    export interface Props {
      /**
       * Outer height of List is set to "auto". This property should only be used in conjunction with the
       * WindowScroller HOC.
       */
      autoHeight?:	boolean
      /**
       * Optional custom CSS class name to attach to root List element.
       */
      className?:	string
      /**
       * Used to estimate the total height of a List before all of its rows have actually been measured. The estimated
       * total height is adjusted as rows are rendered.
       */
      estimatedRowSize?:	number
      /**
       * Height constraint for list (determines how many actual rows are rendered)
       */
      height:	number
      /**
       * Optional custom id to attach to root List element.
       */
      id?: string
      /**
       * Callback used to render placeholder content when rowCount is 0
       */
      noRowsRenderer?: () => React.ReactNode
      /**
       * Callback invoked with information about the slice of rows that were just rendered:
       * ({ overscanStartIndex: number, overscanStopIndex: number, startIndex: number, stopIndex: number }): void
       */
      onRowsRendered?: (props: { overscanStartIndex: number, overscanStopIndex: number, startIndex: number, stopIndex: number }) => void
      /**
       * Callback invoked whenever the scroll offset changes within the inner scrollable region:
       * ({ clientHeight: number, scrollHeight: number, scrollTop: number }): void
       */
      onScroll?: (props: { clientHeight: number, scrollHeight: number, scrollTop: number }) => void
      /**
       * Number of rows to render above/below the visible bounds of the list. This can help reduce flickering during
       * scrolling on certain browers/devices.
       */
      overscanRowCount?:	number
      /**
       * Number of rows in list.
       */
      rowCount:	number
      /**
       * Either a fixed row height (number) or a function that returns the height of a row given its index:
       * ({ index: number }): number
       */
      rowHeight: number | ((props: { index: number }) => number)
      /**
       * Responsible for rendering a row. Signature should look like
       * ({ index: number, key: string, style: Object, isScrolling: boolean }): React.PropTypes.node
       * and the returned element must handle index, key and style.
       */
      rowRenderer: (props: { index: number, key: string, style: Object, isScrolling: boolean }) => React.ReactNode
      /**
       * Controls the alignment scrolled-to-rows. The default ("auto") scrolls the least amount possible to ensure
       * that the specified row is fully visible. Use "start" to always align rows to the top of the list and "end"
       * to align them bottom. Use "center" to align them in the middle of container.
       */
      scrollToAlignment?:	'auto' | 'start' | 'end' | 'center'
      /**
       * Row index to ensure visible (by forcefully scrolling if necessary)
       */
      scrollToIndex?:	number
      /**
       * Forced vertical scroll offset; can be used to synchronize scrolling between components
       */
      scrollTop?:	number
      /**
       * Optional custom inline style to attach to root List element.
       */
      style?:	Object
      /**
       * Optional override of tab index default; defaults to 0.
       */
      tabIndex?:	number
      /**
       * Width of the list
       */
      width: number
    }
  }


  /**
   * Table component with fixed headers and windowed rows for improved performance with large data sets. This 
   * component expects explicit width and height parameters. Table content can scroll vertically but it is not
   * meant to scroll horizontally.
   */
  export class Table extends React.Component<Table.Props, any> {
    /**
     * Forcefull re-render the inner Grid component.
     * 
     * Calling forceUpdate on Table may not re-render the inner Grid since it uses shallowCompare as a performance
     * optimization. Use this method if you want to manually trigger a re-render. This may be appropriate if the
     * underlying row data has changed but the row sizes themselves have not.
     */
    forceUpdateGrid(): void
    /**
     * Pre-measure all rows in a Table.
     * 
     * Typically rows are only measured as needed and estimated heights are used for cells that have not yet been
     * measured. This method ensures that the next call to getTotalSize() returns an exact size (as opposed to just
     * an estimated one).
     */
    measureAllRows(): void
    /**
     * Recompute row heights and offsets after the specified index (defaults to 0).
     * 
     * Table has no way of knowing when its underlying list data has changed since it only receives a rowHeight
     * property. If the rowHeight is a number it can compare before and after values but if it is a function that
     * comparison is error prone. In the event that a dynamic rowHeight function is in use and the row heights have
     * changed this function should be manually called by the "smart" container parent.
     * 
     * This method will also force a render cycle (via forceUpdate) to ensure that the updated measurements are
     * reflected in the rendered table.
     */
    recomputeRowHeights(index: number): void
  }

  export namespace Table {
    export type RowRenderer = (props: {
      /**
       * Row-level class name
       */
      className: string
      /**
       * Array of React nodes
       */
      columns: React.ReactNode[]
      /**
       * Row index
       */
      index: number
      /**
       * Boolean flag indicating if Table is currently being scrolled
       */
      isScrolling: boolean
      /**
       * Optional row onClick handler
       */
      onRowClick: Function
      /**
       * Optional row onDoubleClick handler
       */
      onRowDoubleClick: Function
      /**
       * Optional row onMouseOver handler
       */
      onRowMouseOver: Function
      /**
       * Optional row onMouseOut handler
       */
      onRowMouseOut: Function
      /**
       * Row data
       */
      rowData: Function
      /**
       * Row-level style object      
       */
      style: Object
    }) => React.ReactElement<any>

    export interface Props {
      /**
       * Outer height of Table is set to "auto". This property should only be used in conjunction with the
       * WindowScroller HOC.
       */
      autoHeight?: boolean
      /**
       * One or more Columns describing the data displayed in this table
       */
      children?:	Column | Column[]
      /**
       * Optional custom CSS class name to attach to root Table element.
       */
      className?:	string
      /**
       * Do not render the table header (only the rows)
       */
      disableHeader?:	boolean
      /**
       * Used to estimate the total height of a Table before all of its rows have actually been measured.
       * The estimated total height is adjusted as rows are rendered.
       */
      estimatedRowSize?: number
      /**
       * Optional custom CSS class name to attach to inner Grid element
       */
      gridClassName?:	string
      /**
       * Optional inline style to attach to inner Grid element
       */
      gridStyle?:	Object
      /**
       * CSS class to apply to all column headers
       */
      headerClassName?:	string
      /**
       * Fixed height of header row
       */
      headerHeight:	number
      /**
       * Optional custom inline style to attach to table header columns.
       */
      headerStyle?:	Object
      /**
       * Fixed/available height for out DOM element
       */
      height: number
      /**
       * Optional custom id to attach to root Table element.
       */
      id?: string
      /**
       * Callback used to render placeholder content when :rowCount is 0
       */
      noRowsRenderer?: () => React.ReactNode
      /**
       * Callback invoked when a user clicks on a table header. (dataKey: string, columnData: any): void
       */
      onHeaderClick?:	(dataKey: string, columnData: any) => void
      /**
       * Callback invoked when a user clicks on a table row. ({ index: number }): void
       */
      onRowClick?: (props: { index: number }) => void
      /**
       * Callback invoked when a user double-clicks on a table row. ({ index: number }): void
       */
      onRowDoubleClick?: (props: { index: number }) => void
      /**
       * Callback invoked when the mouse leaves a table row. ({ index: number }): void
       */
      onRowMouseOut?:	(props: { index: number }) => void
      /**
       * Callback invoked when a user moves the mouse over a table row. ({ index: number }): void
       */
      onRowMouseOver?: (props: { index: number }) => void
      /**
       * Callback invoked with information about the slice of rows that were just rendered:
       * ({ overscanStartIndex: number, overscanStopIndex: number, startIndex: number, stopIndex: number }): void
       */
      onRowsRendered?: (props: { overscanStartIndex: number, overscanStopIndex: number, startIndex: number, stopIndex: number }) => void
      /**
       * Number of rows to render above/below the visible bounds of the list. This can help reduce
       * flickering during scrolling on certain browers/devices.
       */
      overscanRowCount?: number
      /**
       * Callback invoked whenever the scroll offset changes within the inner scrollable region:
       * ({ clientHeight: number, scrollHeight: number, scrollTop: number }): void
       */
      onScroll?: (props: { clientHeight: number, scrollHeight: number, scrollTop: number }) => void
      /**
       * CSS class to apply to all table rows (including the header row). This value may be either a static
       * string or a function with the signature ({ index: number }): string.
       * Note that for the header row an index of -1 is provided.
       */
      rowClassName?: string | ((props: { index: number }) => string)
      /**
       * Number of rows in table.
       */
      rowCount:	Number
      /**
       * Callback responsible for returning a data row given an index. ({ index: int }): any
       */
      rowGetter: (props: { index: number }) => any
      /**
       * Either a fixed row height (number) or a function that returns the height of a row given its index:
       * ({ index: number }): number
       */
      rowHeight: number | ((props: { index: number }) => number)
      /**
       *  Responsible for rendering a table row given an array of columns. Learn more
       */
      rowRenderer?:	RowRenderer
      /**
       * Optional custom inline style to attach to table rows. This value may be either a style object or a
       * function with the signature ({ index: number }): Object. Note that for the header row an index of -1
       * is provided.
       */
      rowStyle?: Object | ((props: { index: number }) => Object)
      /**
       * Controls the alignment scrolled-to-rows. The default ("auto") scrolls the least amount possible to
       * ensure that the specified row is fully visible. Use "start" to always align rows to the top of the
       * list and "end" to align them bottom. Use "center" to align them in the middle of container.
       */
      scrollToAlignment?: 'auto' | 'start' | 'end' | 'center'
      /**
       * Row index to ensure visible (by forcefully scrolling if necessary)
       */
      scrollToIndex?:	number
      /**
       * Vertical offset
       */
      scrollTop?:	number
      /**
       * Sort function to be called if a sortable header is clicked.
       * ({ sortBy: string, sortDirection: SortDirection }): void
       */
      sort?: ({ sortBy: string, sortDirection: SortDirection })
      /**
       * Data is currently sorted by this dataKey (if it is sorted at all)
       */
      sortBy?: string
      /**
       * Data is currently sorted in this direction (if it is sorted at all)
       */
      sortDirection?:	SortDirection
      /**
       * Optional custom inline style to attach to root Table element.
       */
      style?:	Object
      /**
       * Optional override of inner Grid tab index default; defaults to 0.
       */
      tabIndex?: number
      /**
       * Width of the table
       */
      width: number
    }
  }

  export type SortDirection = 'ASC' | 'DESC'
  export namespace SortDirection {
    export const ASC: SortDirection
    export const DESC: SortDirection
  }

  /**
   * Describes the header and cell contents of a table column.
   */
  export class Column extends React.Component<Column.Props, any> {
  }

  export namespace Column {
    export type CellDataGetter = (props: {
      columnData: any,
      dataKey: string,
      rowData: any
    }) => any
    export type CellRenderer = (props: {
      cellData: any,
      columnData: any,
      dataKey: string,
      isScrolling: boolean,
      rowData: any,
      rowIndex: number
    }) => React.ReactNode
    export type HeaderRenderer = (props: {
      columnData: any,
      dataKey: string,
      disableSort: boolean,
      label: string,
      sortBy: string,
      sortDirection: SortDirection
    }) => React.ReactElement<any>

    export interface Props {
      /**
       * Callback responsible for returning a cell's data, given its dataKey. Learn more
       */
      cellDataGetter?: CellDataGetter
      /**
       * Callback responsible for rendering a cell's contents. Learn more
       */
      cellRenderer?: CellRenderer
      /**
       * CSS class to apply to rendered cell container
       */
      className?:	string
      /**
       * Additional data passed to this column's cellDataGetter. Use this object to relay action-creators
       * or relational data.
       */
      columnData?: Object
      /**
       * Uniquely identifies the row-data attribute corresponding to this cell (eg this might be "name"
       * in an array of user objects).
       */
      dataKey: any
      /**
       * If sort is enabled for the table at large, disable it for this column
       */
      disableSort?:	boolean
      /**
       * Flex grow style; defaults to 0
       */
      flexGrow?: number
      /**
       * Flex shrink style; defaults to 1
       */
      flexShrink?: number
      /**
       * CSS class to apply to this column's header
       */
      headerClassName?:	string
      /**
       * Optional callback responsible for rendering a column's header column. Learn more
       */
      headerRenderer?: HeaderRenderer
      /**
       * Header label for this column
       */
      label?: string
      /**
       * Maximum width of column; this property will only be used if :flexGrow is greater than 0
       */
      maxWidth?: number
      /**
       * Minimum width of column
       */
      minWidth?: number
      /**
       * Optional inline style to apply to rendered cell container
       */
      style?:	Object
      /**
       * Flex basis (width) for this column; This value can grow or shrink based on flexGrow and flexShrink
       * properties
       */
      width: number
    }
  }


  /**
   * High-order component that decorates another virtualized component and responds to arrow-key events by
   * scrolling one row or column at a time. This provides a snap-to behavior rather than the default browser
   * scrolling behavior.
   * 
   * Note that unlike the other HOCs in react-virtualized, the ArrowKeyStepper adds a <div> element around its
   * children in order to attach a key-down event handler. The appearance of this wrapper element can be
   * customized using the className property.
   */
  export class ArrowKeyStepper extends React.Component<ArrowKeyStepper.Props, any> {
  }

  export module ArrowKeyStepper {
    export interface Props {
      /**
       * Function responsible for rendering children. This function should implement the following signature:
       * ({ onSectionRendered: Function, scrollToColumn: number, scrollToRow: number }) => PropTypes.element
       */
      children?: React.StatelessComponent<ChildrenProps>
      /**
       * CSS class name to attach to the wrapper <div>.
       */
      className?: string
      /**
       * Number of columns in grid; for Table and List this property should always be 1.
       */
      columnCount: number
      /**
       * Controls behavior of stepper when arrow key direction changes. "cells" means that the index will
       * only increment or decrement by 1; "edges" (default) means that the opposite side of the grid will
       * be incremented.
       */
      mode?: 'edges' | 'cells'
      /**
       * Number of rows in grid.
       */
      rowCount: number
      /**
       * Optional default/initial scrollToColumn value
       */
      scrollToColumn?: number
      /**
       * Optional default/initial scrollToRow value
       */
      scrollToRow?: number
    }

    export interface ChildrenProps {
      /**
       * Pass-through callback to be attached to child component; informs the key-stepper which range of 
       * cells are currently visible.
       */
      onSectionRendered: Function
      /**
       * Specifies which column in the child component should be visible
       */
      scrollToColumn: number
      /**
       * Specifies which row in the child component should be visible
       */
      scrollToRow: number
    }
  }


  /**
   * High-order component that automatically adjusts the width and height of a single child.
   */
  export class AutoSizer extends React.Component<AutoSizer.Props, any> {
  }

  export namespace AutoSizer {
    export interface Props {
    /**
     * Function responsible for rendering children. This function should implement the following signature:
     * ({ height: number, width: number }) => PropTypes.element
     */
    children?: React.StatelessComponent<ChildrenProps>
    /**
     * Fixed height; if specified, the child's height property will not be managed
     */
    disableHeight?: boolean
    /**
     * Fixed width; if specified, the child's width property will not be managed
     */
    disableWidth?: boolean
    /**
     * Callback to be invoked on-resize; it is passed the following named parameters:
     * ({ height: number, width: number }).
     */
    onResize?: (props: { height: number, width: number }) => void
    }

    export interface ChildrenProps {
      height: number
      width: number
    }
  }

  /**
   * High-order component that automatically measures a cell's contents by temporarily rendering it in a 
   * way that is not visible to the user. Specify a fixed width to measure dynamic height (or vice versa).
   * 
   * This is an advanced component and has some limitations and performance considerations. See below for 
   * more information.
   * 
   * CellMeasurer is intended for use with Grid components but can be adapted to work with List as well.
   */
  export class CellMeasurer extends React.Component<CellMeasurer.Props, any> {
  }

  export namespace CellMeasurer {
    export type CellRenderer = (props: { columnIndex: number, rowIndex: number, index: number }) => React.ReactNode

    export interface Props {
      /**
       * Renders a cell given its indices. ({ columnIndex: number, rowIndex: number, index: number }): PropTypes.node.
       * 
       * NOTE: index is just an alias to rowIndex
       */
      cellRenderer: CellRenderer
      /**
       * Optional, custom caching strategy for cell sizes. Learn more here.
       */
      cellSizeCache?: CellSizeCache
      /**
       * Function responsible for rendering a virtualized component;
       * ({ getColumnWidth: Function, getRowHeight: Function, resetMeasurements: Function }) => PropTypes.element
       */
      children?: React.StatelessComponent<ChildrenProps>
      /**
       * Number of columns in the Grid; in order to measure a row's height, all of that row's columns must be
       * rendered.
       */
      columnCount: number
      /**
       * A Node, Component instance, or function that returns either. If this property is not specified the
       * document body will be used.
       */
      container?: any
      /**
       * Fixed height; specify this property to measure cell-width only.
       */
      height?: number
      /**
       * Number of rows in the Grid; in order to measure a column's width, all of that column's rows must be
       * rendered.
       */
      rowCount: number
      /**
       * Fixed width; specify this property to measure cell-height only.
       */
      width?: number
    }

    export interface ChildrenProps {
      /**
       * Callback to set as the columnWidth property of a Grid
       */
      getColumnWidth: Function
      /**
       * Callback to set as the rowHeight property of a Grid
       */
      getRowHeight: Function
      /**
       * Use this function to clear cached measurements for specific column in CellRenderer; its size will
       * be remeasured the next time it is requested.
       */
      resetMeasurementForColumn(index: number): void
      /**
       * Use this function to clear cached measurements for specific row in CellRenderer; its size will be
       * remeasured the next time it is requested.
       */
      resetMeasurementForRow(index: number): void
      /**
       * Function	Use this function to clear cached measurements in CellRenderer; each cell will be
       * remeasured the next time its size is requested.
       */
      resetMeasurements(): void
    }
  }

  export interface CellSizeCache {
    clearAllColumnWidths (): void;
    clearAllRowHeights (): void;
    clearColumnWidth (index: number): void;
    clearRowHeight (index: number): void;
    getColumnWidth (index: number): number | undefined | null;
    getRowHeight (index: number): number | undefined | null;
    setColumnWidth (index: number, width: number): void;
    setRowHeight (index: number, height: number): void;
  }


  /**
   * High-order component that auto-calculates column-widths for Grid cells.
   */
  export class ColumnSizer extends React.Component<ColumnSizer.Props, any> {
  }

  export namespace ColumnSizer {
    export interface Props {
      /**
       * Function responsible for rendering a virtualized Grid. This function should implement the following signature:
       * ({ adjustedWidth: number, getColumnWidth: Function, registerChild: Function }) => PropTypes.element
       */
      children?:	React.StatelessComponent<ChildrenProps>
      /**
       * Optional maximum allowed column width
       */
      columnMaxWidth?:	number
      /**
       * Optional minimum allowed column width
       */
      columnMinWidth?:	number
      /**
       * Width of Grid or Table child
       */
      width:	number
    }

    export interface ChildrenProps {
      /**
       * This number reflects the lesser of the overall Grid width or the width of all columns. Use this 
       * to make your Grid shrink to fit sparse content.
       */
      adjustedWidth: number
      /**
       * This function should be passed to the Grid's columnWidth property.
       */
      getColumnWidth:	Function
      /**
       * This function should be set as the child's ref property. It enables a set of rows to be refreshed
       * once their data has finished loading.
       */
      registerChild: Function
    }
  }

  /**
   * High-order component that manages just-in-time fetching of data as a user scrolls up or down in a list.
   * 
   * Note that this component is inteded to assist with row-loading. As such it is best suited for use with
   * Table and List (although it can also be used with Grid). This HOC is not compatible with the Collection
   * component.
   * 
   * This is an advanced component and can be confusing in certain situations. See below for more information.
   */
  export class InfiniteLoader extends React.Component<InfiniteLoader.Props, any> {
  }

  export namespace InfiniteLoader {
    export interface Props {
      /**
       * Function responsible for rendering a virtualized component. This function should implement the
       * following signature: ({ onRowsRendered: Function, registerChild: Function }) => PropTypes.element
       */
      children?:	React.StatelessComponent<ChildrenProps>
      /**
       * Function responsible for tracking the loaded state of each row. It should implement the following
       * signature: ({ index: number }): boolean
       */
      isRowLoaded:	(props: { index: number }) => boolean
      /**
       * Callback to be invoked when more rows must be loaded. It should implement the following signature:
       * ({ startIndex: number, stopIndex: number }): Promise.
       * The returned Promise should be resolved once row data has finished loading. It will be used to
       * determine when to refresh the list with the newly-loaded data. This callback may be called multiple
       * times in reaction to a single scroll event.
       */
      loadMoreRows:	(props: { startIndex: number, stopIndex: number }) => Promise<any>
      /**
       * Minimum number of rows to be loaded at a time. This property can be used to batch requests to
       * reduce HTTP requests. Defaults to 10.
       */
      minimumBatchSize?:	number
      /**
       * Number of rows in list; can be arbitrary high number if actual number is unknown.
       */
      rowCount:	number
      /**
       * Threshold at which to pre-fetch data. A threshold X means that data will start loading when a
       * user scrolls within X rows. Defaults to 15.
       */
      threshold?:	number
    }

    export interface ChildrenProps {
      /**
       * This function should be passed as the child's onRowsRendered property. It informs the loader when
       * the user is scrolling.
       */
      onRowsRendered:	Function
      /**
       * This function should be set as the child's ref property. It enables a set of rows to be refreshed
       * once their data has finished loading.
       */
      registerChild:	Function
    }
  }


  /**
   * High order component that simplifies the process of synchronizing scrolling between two or more 
   * virtualized components.
   */
  export class ScrollSync extends React.Component<ScrollSync.Props, any> {
  }

  export namespace ScrollSync {
    export interface Props {
      /**
       * Function responsible for rendering 2 or more virtualized components. See below for details 
       * about this function's signature.
       */
      children?:	React.StatelessComponent<ChildrenProps>
    }

    export interface ChildrenProps {
      /**
       * Height of the visible portion of the Grid (or other scroll-synced component)
       */
      clientHeight:	number
      /**
       * Width of the visible portion of the Grid (or other scroll-synced component)
       */
      clientWidth:	number
      /**
       * This function should be passed through to at least one of the virtualized child components.
       * Updates to it will trigger updates to the scroll ofset parameters which will in turn update
       * the other virtualized children.
       */
      onScroll:	Function
      /**
       * Total height of all rows in the Grid (or other scroll-synced component)
       */
      scrollHeight:	number
      /**
       * The current scroll-left offset.
       */
      scrollLeft:	number
      /**
       * The current scroll-top offset.
       */
      scrollTop:	number
      /**
       * Total width of all rows in the Grid (or other scroll-synced component)
       */
      scrollWidth:	number
    }
  }


  /**
   * High-order component that enables a Table or List component to be scrolled based on the
   * window's scroll positions. This can be used to create layouts similar to Facebook or Twitter
   * news feeds.
   * 
   * Note that this HOC does not currently work with a horizontally-scrolling Grid as horizontal
   * scrolls reset the internal scrollTop. This may change with a future release but for the time
   * being this HOC is should be used with Table or List only.
   */
  export class WindowScroller extends React.Component<WindowScroller.Props, any> {
    /**
     * Recalculates scroll position from the top of page.
     * 
     * This methoed is automatically triggered when the component mounts as well as when the
     * browser resizes. It should be manually called if the page header (eg any items in the
     * DOM "above" the WindowScroller) resizes or changes.
     */
    updatePosition(): void
  }

  export namespace WindowScroller {
    export interface Props {
      /**
       * Function responsible for rendering children. This function should implement the following
       * signature: ({ height: number, isScrolling: boolean, scrollTop: number }) => PropTypes.element
       */
      children?: React.StatelessComponent<ChildrenProps>
      /**
       * Callback to be invoked on-resize; it is passed the following named parameters:
       * ({ height: number }).
       */
      onResize?: (props: { height: number }) => void
      /**
       * Callback to be invoked on-scroll; it is passed the following named parameters:
       * ({ scrollTop: number }).
       */
      onScroll?: (props: { scrollTop: number }) => void
    }

    export interface ChildrenProps {
      height: number
      isScrolling: boolean
      scrollTop: number
    }
  }
}
