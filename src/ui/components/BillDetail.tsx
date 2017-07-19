import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Button } from 'react-bootstrap'
import { defineMessages, FormattedDate } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, mapProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { AppState, pushChanges, mapDispatchToProps, deleteDoc } from '../../state/index'
import { Bill } from '../../docs/index'
import { showBillDialog } from '../dialogs/index'

interface Props {
  item: Bill.View
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  showBillDialog: typeof showBillDialog
}

interface MappedProps {
  date: Date
}

interface Handlers {
  startEdit: () => void
  deleteMe: () => void
}

type EnhancedProps = Props & DispatchProps & Handlers

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('BillDetail'),
  onlyUpdateForPropTypes,
  setPropTypes({
    item: PropTypes.object.isRequired
  }),
  connect<{}, DispatchProps, Props>(
    (state: AppState) => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges, showBillDialog })
  ),
  mapProps<MappedProps, DispatchProps & Props>(props => ({
    ...props,
    date: Bill.getDate(props.item)
  })),
  withHandlers<Handlers, MappedProps & DispatchProps & Props>({
    startEdit: ({ item, showBillDialog }) => () => {
      showBillDialog({ edit: item })
    },
    deleteMe: ({item, pushChanges}) => () => {
      pushChanges({docs: [deleteDoc(item.doc)]})
    }
  }),
)

export const BillDetail = enhance(({item, startEdit, deleteMe}) => {
  const date = Bill.getDate(item)
  return <div>
    name: {item.doc.name}<br/>
    group: {item.doc.group}<br/>
    date: <FormattedDate value={date}/><br/>
    <Button onClick={startEdit}>edit</Button>
    <Button onClick={deleteMe}>delete</Button>
  </div>
})
