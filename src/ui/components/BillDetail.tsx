import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Button } from 'react-bootstrap'
import { defineMessages, FormattedDate } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, mapProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { AppState, pushChanges, mapDispatchToProps, deleteDoc } from '../../state/index'
import { Bill } from '../../docs/index'
import { BillDialog } from './BillDialog'


interface Props {
  item: Bill.View
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface MappedProps {
  date: Date
}

interface UIState {
  editing?: Bill.DocId
}

interface Handlers {
  startEdit: () => void
  cancelEdit: () => void
  deleteMe: () => void
}

type EnhancedProps = Props & ReduxUIProps<UIState> & DispatchProps & Handlers

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('BillDetail'),
  onlyUpdateForPropTypes,
  setPropTypes({
    item: PropTypes.object.isRequired
  }),
  connect<{}, DispatchProps, Props>(
    (state: AppState) => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  mapProps<MappedProps, DispatchProps & Props>(props => ({
    ...props,
    date: Bill.getDate(props.item)
  })),
  ui<UIState, Props, {}>({
    key: 'BillDetail',
    persist: true,
    state: {
      editing: undefined
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & MappedProps & DispatchProps & Props>({
    startEdit: ({item, updateUI}) => () => {
      updateUI({editing: item.doc._id})
    },
    cancelEdit: ({updateUI}) => () => {
      updateUI({editing: undefined})
    },
    deleteMe: ({item, pushChanges}) => () => {
      pushChanges({docs: [deleteDoc(item.doc)]})
    }
  }),
)

export const BillDetail = enhance(({ui: { editing }, item, startEdit, cancelEdit, deleteMe}) => {
  const date = Bill.getDate(item)
  return <div>
    name: {item.doc.name}<br/>
    group: {item.doc.group}<br/>
    date: <FormattedDate value={date}/><br/>
    <Button onClick={startEdit}>edit</Button>
    <Button onClick={deleteMe}>delete</Button>
    <BillDialog edit={item} onHide={cancelEdit} show={!!editing}/>
  </div>
})
