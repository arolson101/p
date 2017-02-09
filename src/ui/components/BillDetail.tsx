import * as React from 'react'
import { Button } from 'react-bootstrap'
import { defineMessages, FormattedDate } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, mapProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { AppState, pushChanges, mapDispatchToProps, deleteDoc } from '../../state'
import { Bill } from '../../docs'
import { withPropChangeCallback } from '../enhancers'
import { BillForm, SubmitFunction } from './BillForm'

const messages = defineMessages({
  page: {
    id: 'BillDetail.page',
    defaultMessage: 'Edit Bill'
  }
})

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
  editing: boolean
}

interface EnhancedProps {
  startEdit: () => void
  cancelEdit: () => void
  deleteMe: () => void
  saveEdit: SubmitFunction<Bill.Doc>
}

type AllProps = Props & ReduxUIProps<UIState> & DispatchProps & EnhancedProps

const enhance = compose<AllProps, Props>(
  setDisplayName('BillDetail'),
  onlyUpdateForPropTypes,
  setPropTypes({
    item: React.PropTypes.object.isRequired
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
      editing: false
    } as UIState
  }),
  withHandlers<EnhancedProps, ReduxUIProps<UIState> & MappedProps & DispatchProps & Props>({
    startEdit: ({updateUI}) => () => {
      updateUI({editing: true})
    },
    cancelEdit: ({updateUI}) => () => {
      updateUI({editing: false})
    },
    saveEdit: ({updateUI, pushChanges}) => async (doc: Bill.Doc) => {
      await pushChanges({ docs: [doc] })
      updateUI({editing: false})
    },
    deleteMe: ({item, pushChanges}) => () => {
      pushChanges({docs: [deleteDoc(item.doc)]})
    }
  }),
  withPropChangeCallback<EnhancedProps & ReduxUIProps<UIState> & MappedProps & DispatchProps & Props>(
    'item',
    ({updateUI}) => {
      updateUI({editing: false})
    }
  )
)

export const BillDetail = enhance(({ui: { editing }, item, startEdit, saveEdit, cancelEdit, deleteMe}) => {
  const date = Bill.getDate(item)

  if (editing) {
    return <BillForm title={messages.page} edit={item} onSubmit={saveEdit} onCancel={cancelEdit} />
  } else {
    return <div>
      name: {item.doc.name}<br/>
      group: {item.doc.group}<br/>
      date: <FormattedDate value={date}/><br/>
      <Button onClick={startEdit}>edit</Button>
      <Button onClick={deleteMe}>delete</Button>
    </div>
  }
})
